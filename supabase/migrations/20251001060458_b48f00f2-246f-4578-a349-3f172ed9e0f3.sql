-- Add new roles to the enum (if not already added)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'Parent') THEN
    ALTER TYPE user_role ADD VALUE 'Parent';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'Support') THEN
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
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id text,
  occupation text,
  emergency_contact text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;

-- Support profiles
CREATE TABLE IF NOT EXISTS public.support_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  support_id text,
  specialization text,
  access_level text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.support_profiles ENABLE ROW LEVEL SECURITY;

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

-- Fees table
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