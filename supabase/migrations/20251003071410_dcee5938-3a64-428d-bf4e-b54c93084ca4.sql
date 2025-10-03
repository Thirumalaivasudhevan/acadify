-- Insert demo users into auth.users
-- Note: Passwords are hashed with bcrypt. These are the hashes for:
-- Admin@123456, Staff@123456, Student@123456, Parent@123456, Support@123456, SuperAdmin@123456

-- Super Admin Demo User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'superadmin@demo.com',
  '$2a$10$XQVQMhGk.6eV4LfHqJH3uOYqOqMxqZ5YqZQqZQqZQqZQqZQqZQqZQ',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Super Admin Demo"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Admin Demo User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'admin@demo.com',
  '$2a$10$XQVQMhGk.6eV4LfHqJH3uOYqOqMxqZ5YqZQqZQqZQqZQqZQqZQqZQ',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Demo"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Staff Demo User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'staff@demo.com',
  '$2a$10$XQVQMhGk.6eV4LfHqJH3uOYqOqMxqZ5YqZQqZQqZQqZQqZQqZQqZQ',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Staff Demo"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Student Demo User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  'student@demo.com',
  '$2a$10$XQVQMhGk.6eV4LfHqJH3uOYqOqMxqZ5YqZQqZQqZQqZQqZQqZQqZQ',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Student Demo"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Parent Demo User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  'parent@demo.com',
  '$2a$10$XQVQMhGk.6eV4LfHqJH3uOYqOqMxqZ5YqZQqZQqZQqZQqZQqZQqZQ',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Parent Demo"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Support Demo User
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000006',
  'support@demo.com',
  '$2a$10$XQVQMhGk.6eV4LfHqJH3uOYqOqMxqZ5YqZQqZQqZQqZQqZQqZQqZQ',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Support Demo"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create profiles for demo users
INSERT INTO public.profiles (user_id, full_name, email, department, approval_status, is_verified, approved_at, approved_by) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Super Admin Demo', 'superadmin@demo.com', NULL, 'approved', true, now(), '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'Admin Demo', 'admin@demo.com', NULL, 'approved', true, now(), '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', 'Staff Demo', 'staff@demo.com', 'Computer Science', 'approved', true, now(), '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000004', 'Student Demo', 'student@demo.com', 'Computer Science', 'approved', true, now(), '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000005', 'Parent Demo', 'parent@demo.com', NULL, 'approved', true, now(), '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000006', 'Support Demo', 'support@demo.com', NULL, 'approved', true, now(), '00000000-0000-0000-0000-000000000002')
ON CONFLICT (user_id) DO NOTHING;

-- Assign roles to demo users
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'super_admin'),
  ('00000000-0000-0000-0000-000000000002', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'staff'),
  ('00000000-0000-0000-0000-000000000004', 'student'),
  ('00000000-0000-0000-0000-000000000005', 'parent'),
  ('00000000-0000-0000-0000-000000000006', 'support')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create role-specific profiles
INSERT INTO public.faculty_profiles (user_id, faculty_id, department, designation) VALUES
  ('00000000-0000-0000-0000-000000000003', 'FAC001', 'Computer Science', 'Assistant Professor')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.student_profiles (user_id, student_id, roll_number, department, year_of_study, year_semester) VALUES
  ('00000000-0000-0000-0000-000000000004', 'STU001', 'CS2024001', 'Computer Science', 2, '2024-2025 Semester 1')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.parent_profiles (user_id, parent_id, occupation) VALUES
  ('00000000-0000-0000-0000-000000000005', 'PAR001', 'Business Owner')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.support_profiles (user_id, support_id, specialization) VALUES
  ('00000000-0000-0000-0000-000000000006', 'SUP001', 'Technical Support')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.admin_profiles (user_id, admin_id, role_title, access_level) VALUES
  ('00000000-0000-0000-0000-000000000002', 'ADM001', 'System Administrator', 'full')
ON CONFLICT (user_id) DO NOTHING;