-- First, check and add missing enum values in the correct order
DO $$ 
BEGIN
    -- Add Admin role
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Admin' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'Admin';
    END IF;
    
    -- Add Parent role
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Parent' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'Parent';
    END IF;
    
    -- Add Support role
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Support' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'Support';
    END IF;
END $$;

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  subscription_status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Update profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id),
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Parent profiles
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id text,
  occupation text,
  emergency_contact text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage own profile" ON public.parent_profiles FOR ALL USING (auth.uid() = user_id);

-- Support profiles
CREATE TABLE IF NOT EXISTS public.support_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  support_id text,
  specialization text,
  access_level text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.support_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support can manage own profile" ON public.support_profiles FOR ALL USING (auth.uid() = user_id);

-- Student-parent mapping
CREATE TABLE IF NOT EXISTS public.student_parent_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, parent_id)
);

ALTER TABLE public.student_parent_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View student-parent mapping" ON public.student_parent_mapping FOR SELECT 
USING (auth.uid() = parent_id OR auth.uid() = student_id);

-- Fees
CREATE TABLE IF NOT EXISTS public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  fee_type text NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status text NOT NULL DEFAULT 'pending',
  academic_year text,
  semester text,
  remarks text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own fees" ON public.fees FOR SELECT USING ((auth.uid())::text = student_id::text);

CREATE POLICY "Parents view children fees" ON public.fees FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.student_parent_mapping WHERE student_id::text = fees.student_id::text AND parent_id = auth.uid()));

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  target_role text NOT NULL,
  department text,
  priority text DEFAULT 'normal',
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View announcements" ON public.announcements FOR SELECT USING (true);

-- Leave requests
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  approved_by uuid,
  remarks text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own leave" ON public.leave_requests FOR ALL USING (auth.uid()::text = student_id::text);

CREATE POLICY "Parents view children leave" ON public.leave_requests FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.student_parent_mapping WHERE student_id::text = leave_requests.student_id::text AND parent_id = auth.uid()));

-- Triggers
CREATE TRIGGER update_parent_profiles_updated_at BEFORE UPDATE ON public.parent_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_profiles_updated_at BEFORE UPDATE ON public.support_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();