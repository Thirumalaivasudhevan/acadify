-- Add profile photo storage and update profile tables

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

-- Create storage policies for profile photos
CREATE POLICY "Users can view their own profile photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add missing fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add missing fields to student_profiles table
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS year_semester TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS cgpa DECIMAL(3,2);
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS achievements TEXT[];

-- Add missing fields to faculty_profiles table
ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS research_publications TEXT[];

-- Create admin_profiles table for admin users
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  admin_id TEXT,
  role_title TEXT,
  access_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_profiles
CREATE POLICY "Admins can view their own admin profile" 
ON public.admin_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert their own admin profile" 
ON public.admin_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update their own admin profile" 
ON public.admin_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for admin_profiles updated_at
CREATE TRIGGER update_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();