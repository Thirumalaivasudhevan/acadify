-- Create app roles enum
CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'admin', 
  'staff',
  'student',
  'parent',
  'support'
);

-- Create user_roles table (critical for security - separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'staff' THEN 3
      WHEN 'student' THEN 4
      WHEN 'parent' THEN 5
      WHEN 'support' THEN 6
    END
  LIMIT 1
$$;

-- Add approval fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS google_auth_id TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- OTP Verifications table
CREATE TABLE public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  otp_code TEXT NOT NULL,
  otp_expiry TIMESTAMPTZ NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('email', 'phone')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Approval requests table
CREATE TABLE public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES auth.users(id),
  requested_role app_role NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for otp_verifications
CREATE POLICY "Users can view their own OTP"
ON public.otp_verifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OTP"
ON public.otp_verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OTP"
ON public.otp_verifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for approval_requests
CREATE POLICY "Users can view their own approval requests"
ON public.approval_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Approvers can view requests assigned to them"
ON public.approval_requests FOR SELECT
TO authenticated
USING (auth.uid() = approver_id);

CREATE POLICY "Super admins can view all approval requests"
ON public.approval_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view staff and below approval requests"
ON public.approval_requests FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  AND requested_role IN ('staff', 'student', 'parent')
);

CREATE POLICY "Staff can view student approval requests"
ON public.approval_requests FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'staff')
  AND requested_role IN ('student', 'parent')
);

CREATE POLICY "Users can create approval requests"
ON public.approval_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Approvers can update approval requests"
ON public.approval_requests FOR UPDATE
TO authenticated
USING (
  auth.uid() = approver_id 
  OR public.has_role(auth.uid(), 'super_admin')
  OR (public.has_role(auth.uid(), 'admin') AND requested_role IN ('staff', 'student', 'parent'))
  OR (public.has_role(auth.uid(), 'staff') AND requested_role IN ('student', 'parent'))
);

-- Update profiles RLS to check approval status
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Trigger to update approval requests timestamp
CREATE OR REPLACE FUNCTION public.update_approval_request_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_approval_requests_timestamp
BEFORE UPDATE ON public.approval_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_approval_request_timestamp();

-- Function to approve user
CREATE OR REPLACE FUNCTION public.approve_user(
  _user_id UUID,
  _approver_id UUID,
  _request_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile
  UPDATE public.profiles
  SET 
    approval_status = 'approved',
    approved_by = _approver_id,
    approved_at = now()
  WHERE user_id = _user_id;
  
  -- Update approval request
  UPDATE public.approval_requests
  SET 
    status = 'approved',
    approver_id = _approver_id,
    updated_at = now()
  WHERE id = _request_id;
  
  RETURN true;
END;
$$;

-- Function to reject user
CREATE OR REPLACE FUNCTION public.reject_user(
  _user_id UUID,
  _approver_id UUID,
  _request_id UUID,
  _remarks TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile
  UPDATE public.profiles
  SET 
    approval_status = 'rejected',
    approved_by = _approver_id,
    approved_at = now()
  WHERE user_id = _user_id;
  
  -- Update approval request
  UPDATE public.approval_requests
  SET 
    status = 'rejected',
    approver_id = _approver_id,
    remarks = _remarks,
    updated_at = now()
  WHERE id = _request_id;
  
  RETURN true;
END;
$$;