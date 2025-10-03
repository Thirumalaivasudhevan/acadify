-- Phase 1: Critical Security Fixes

-- 1. Drop policies that depend on profiles.role column
DROP POLICY IF EXISTS "Faculty can view all quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Faculty can insert quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Faculty can update quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Faculty can delete quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins can view all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;

-- 2. Remove role column from profiles to prevent privilege escalation
ALTER TABLE public.profiles DROP COLUMN role;

-- 3. Recreate quiz_questions policies using has_role()
CREATE POLICY "Faculty can view all quiz questions"
ON public.quiz_questions
FOR SELECT
USING (has_role(auth.uid(), 'staff'));

CREATE POLICY "Faculty can insert quiz questions"
ON public.quiz_questions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'staff'));

CREATE POLICY "Faculty can update quiz questions"
ON public.quiz_questions
FOR UPDATE
USING (has_role(auth.uid(), 'staff'));

CREATE POLICY "Faculty can delete quiz questions"
ON public.quiz_questions
FOR DELETE
USING (has_role(auth.uid(), 'staff'));

-- 4. Update profiles RLS policies - restrict what users can update
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update safe profile fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Ensure security-critical fields cannot be modified by users
  approval_status = (SELECT approval_status FROM public.profiles WHERE user_id = auth.uid()) AND
  approved_by IS NOT DISTINCT FROM (SELECT approved_by FROM public.profiles WHERE user_id = auth.uid()) AND
  approved_at IS NOT DISTINCT FROM (SELECT approved_at FROM public.profiles WHERE user_id = auth.uid()) AND
  is_verified IS NOT DISTINCT FROM (SELECT is_verified FROM public.profiles WHERE user_id = auth.uid())
);

-- 5. Create atomic signup function to prevent workflow bypass
CREATE OR REPLACE FUNCTION public.create_user_with_approval(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_role app_role,
  p_department TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_role_id UUID;
  v_request_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (
    user_id,
    full_name,
    email,
    department,
    approval_status,
    is_verified
  ) VALUES (
    p_user_id,
    p_full_name,
    p_email,
    p_department,
    'pending',
    false
  ) RETURNING id INTO v_profile_id;

  -- Insert user role
  INSERT INTO public.user_roles (
    user_id,
    role
  ) VALUES (
    p_user_id,
    p_role
  ) RETURNING id INTO v_role_id;

  -- Create approval request
  INSERT INTO public.approval_requests (
    user_id,
    requested_role,
    status
  ) VALUES (
    p_user_id,
    p_role,
    'pending'
  ) RETURNING id INTO v_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'profile_id', v_profile_id,
    'role_id', v_role_id,
    'request_id', v_request_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 6. Add role verification to approval functions
CREATE OR REPLACE FUNCTION public.approve_user(_user_id uuid, _approver_id uuid, _request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'staff' THEN 3
    ELSE 999
  END
  LIMIT 1;

  -- Verify approver has authority
  IF v_approver_role = 'super_admin' THEN
    -- Super admin can approve all
    NULL;
  ELSIF v_approver_role = 'admin' AND v_requested_role NOT IN ('super_admin', 'admin') THEN
    -- Admin can approve staff, student, parent, support
    NULL;
  ELSIF v_approver_role = 'staff' AND v_requested_role IN ('student', 'parent') THEN
    -- Staff can approve student, parent
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

CREATE OR REPLACE FUNCTION public.reject_user(_user_id uuid, _approver_id uuid, _request_id uuid, _remarks text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'staff' THEN 3
    ELSE 999
  END
  LIMIT 1;

  -- Verify approver has authority
  IF v_approver_role = 'super_admin' THEN
    NULL;
  ELSIF v_approver_role = 'admin' AND v_requested_role NOT IN ('super_admin', 'admin') THEN
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

-- Phase 2: High-Priority Fixes

-- 7. Add granular PII access controls
-- Faculty can view students in their department
CREATE POLICY "Faculty can view department students"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles fp
    JOIN public.student_profiles sp ON fp.department = sp.department
    WHERE fp.user_id = auth.uid() 
    AND sp.user_id = profiles.user_id
  )
);

-- Admins can view pending approval profiles
CREATE POLICY "Admins can view pending profiles"
ON public.profiles
FOR SELECT
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  AND approval_status = 'pending'
);

-- Parents can view linked student profiles
CREATE POLICY "Parents can view linked students"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.student_parent_mapping spm
    WHERE spm.parent_id = auth.uid()
    AND spm.student_id = profiles.user_id
  )
);

-- 8. Improve student_parent_mapping RLS
DROP POLICY IF EXISTS "View student-parent mapping" ON public.student_parent_mapping;

CREATE POLICY "Students view their parent mappings"
ON public.student_parent_mapping
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Parents view their child mappings"
ON public.student_parent_mapping
FOR SELECT
USING (auth.uid() = parent_id);

CREATE POLICY "Faculty view department mappings"
ON public.student_parent_mapping
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles fp
    JOIN public.student_profiles sp ON fp.department = sp.department
    WHERE fp.user_id = auth.uid() 
    AND sp.user_id = student_parent_mapping.student_id
  )
);

-- 9. Restrict organizations access to admins only
CREATE POLICY "Only admins can view organizations"
ON public.organizations
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only admins can manage organizations"
ON public.organizations
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));