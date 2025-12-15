-- Update app_role enum: Remove super_admin and master_owner, make admin the top role
-- First, update any existing super_admin users to admin
UPDATE public.user_roles SET role = 'admin' WHERE role = 'super_admin';

-- Update database functions to remove super_admin references

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'staff' THEN 2
      WHEN 'student' THEN 3
      WHEN 'parent' THEN 4
      WHEN 'support' THEN 5
    END
  LIMIT 1
$$;

-- Update approve_user function - admin is now top role
CREATE OR REPLACE FUNCTION public.approve_user(_user_id uuid, _approver_id uuid, _request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_requested_role app_role;
  v_approver_role app_role;
  v_current_status TEXT;
BEGIN
  -- Verify the approver is the authenticated user
  IF _approver_id != auth.uid() THEN
    RAISE EXCEPTION 'Approver ID must match authenticated user';
  END IF;

  -- Get the requested role and current status
  SELECT requested_role, status INTO v_requested_role, v_current_status
  FROM public.approval_requests
  WHERE id = _request_id AND user_id = _user_id;

  -- Prevent double approval
  IF v_current_status != 'pending' THEN
    RAISE EXCEPTION 'Request already processed';
  END IF;

  -- Get approver's role
  SELECT role INTO v_approver_role
  FROM public.user_roles
  WHERE user_id = _approver_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'staff' THEN 2
    ELSE 999
  END
  LIMIT 1;

  -- Verify approver has authority
  -- Admin can approve all roles except other admins
  IF v_approver_role = 'admin' AND v_requested_role != 'admin' THEN
    NULL;
  -- Staff can approve students and parents
  ELSIF v_approver_role = 'staff' AND v_requested_role IN ('student', 'parent') THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Insufficient privileges to approve this role';
  END IF;

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

-- Update reject_user function
CREATE OR REPLACE FUNCTION public.reject_user(_user_id uuid, _approver_id uuid, _request_id uuid, _remarks text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_requested_role app_role;
  v_approver_role app_role;
  v_current_status TEXT;
BEGIN
  -- Verify the approver is the authenticated user
  IF _approver_id != auth.uid() THEN
    RAISE EXCEPTION 'Approver ID must match authenticated user';
  END IF;

  -- Validate remarks (max 500 chars)
  IF _remarks IS NOT NULL AND length(_remarks) > 500 THEN
    RAISE EXCEPTION 'Remarks must not exceed 500 characters';
  END IF;

  -- Get the requested role and current status
  SELECT requested_role, status INTO v_requested_role, v_current_status
  FROM public.approval_requests
  WHERE id = _request_id AND user_id = _user_id;

  -- Prevent double rejection
  IF v_current_status != 'pending' THEN
    RAISE EXCEPTION 'Request already processed';
  END IF;

  -- Get approver's role
  SELECT role INTO v_approver_role
  FROM public.user_roles
  WHERE user_id = _approver_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'staff' THEN 2
    ELSE 999
  END
  LIMIT 1;

  -- Verify approver has authority
  IF v_approver_role = 'admin' AND v_requested_role != 'admin' THEN
    NULL;
  ELSIF v_approver_role = 'staff' AND v_requested_role IN ('student', 'parent') THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Insufficient privileges to reject this role';
  END IF;

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

-- Update RLS policies for approval_requests to use admin instead of super_admin
DROP POLICY IF EXISTS "Super admins can view all approval requests" ON public.approval_requests;
DROP POLICY IF EXISTS "Admins can view staff and below approval requests" ON public.approval_requests;
DROP POLICY IF EXISTS "Staff can view student approval requests" ON public.approval_requests;
DROP POLICY IF EXISTS "Approvers can update approval requests" ON public.approval_requests;

-- Admin can view all pending requests (they are top role now)
CREATE POLICY "Admins can view all approval requests"
ON public.approval_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Staff can view student and parent requests
CREATE POLICY "Staff can view student and parent requests"
ON public.approval_requests
FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role) AND requested_role IN ('student'::app_role, 'parent'::app_role));

-- Approvers can update requests based on role hierarchy
CREATE POLICY "Authorized approvers can update requests"
ON public.approval_requests
FOR UPDATE
USING (
  (auth.uid() = approver_id) OR 
  (has_role(auth.uid(), 'admin'::app_role) AND requested_role != 'admin'::app_role) OR
  (has_role(auth.uid(), 'staff'::app_role) AND requested_role IN ('student'::app_role, 'parent'::app_role))
);

-- Update organizations policies to use admin
DROP POLICY IF EXISTS "Only admins can manage organizations" ON public.organizations;
DROP POLICY IF EXISTS "Only admins can view organizations" ON public.organizations;

CREATE POLICY "Admins can view their organization"
ON public.organizations
FOR SELECT
USING (
  id IN (SELECT organization_id FROM profiles WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage organizations"
ON public.organizations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update user_roles policy
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));