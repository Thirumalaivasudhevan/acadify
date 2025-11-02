-- Add explicit RLS deny policies for anonymous users on sensitive tables

-- Deny anonymous access to profiles table
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to student_profiles table  
CREATE POLICY "Deny anonymous access to student_profiles"
ON public.student_profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to faculty_profiles table
CREATE POLICY "Deny anonymous access to faculty_profiles"
ON public.faculty_profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to parent_profiles table
CREATE POLICY "Deny anonymous access to parent_profiles"
ON public.parent_profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to admin_profiles table
CREATE POLICY "Deny anonymous access to admin_profiles"
ON public.admin_profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to support_profiles table
CREATE POLICY "Deny anonymous access to support_profiles"
ON public.support_profiles
FOR SELECT
TO anon
USING (false);