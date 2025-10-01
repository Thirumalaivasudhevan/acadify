-- Add RLS policies for organizations table

-- Admins can view all organizations
CREATE POLICY "Admins can view all organizations"
ON public.organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'Admin'
  )
);

-- Admins can manage organizations
CREATE POLICY "Admins can manage organizations"
ON public.organizations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.role = 'Admin'
  )
);