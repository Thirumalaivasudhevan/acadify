-- Add institution_code to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS institution_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_institution_code 
ON public.organizations(institution_code);

-- Add comment
COMMENT ON COLUMN public.organizations.institution_code IS 'Unique code for institution login (e.g., bru4j)';