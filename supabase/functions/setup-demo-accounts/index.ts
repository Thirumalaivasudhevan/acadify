// Edge function: setup-demo-accounts
// Idempotently ensures demo users exist with approved profiles and roles
// Uses service role key; DO NOT expose this endpoint publicly in UI beyond seeding needs

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

type AppRole = 'super_admin' | 'admin' | 'staff' | 'student' | 'parent' | 'support';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

const accounts: Array<{email: string; password: string; full_name: string; role: AppRole; department?: string;}> = [
  { email: 'superadmin@demo.com', password: 'Demo@123456', full_name: 'Super Admin Demo', role: 'super_admin' },
  { email: 'admin@demo.com',      password: 'Demo@123456', full_name: 'Admin Demo',       role: 'admin' },
  { email: 'staff@demo.com',      password: 'Demo@123456', full_name: 'Staff Demo',       role: 'staff',   department: 'CSE' },
  { email: 'student@demo.com',    password: 'Demo@123456', full_name: 'Student Demo',     role: 'student', department: 'CSE' },
  { email: 'parent@demo.com',     password: 'Demo@123456', full_name: 'Parent Demo',      role: 'parent' },
  { email: 'support@demo.com',    password: 'Demo@123456', full_name: 'Support Demo',     role: 'support' },
];

async function getUserIdByEmail(email: string): Promise<string | null> {
  // Prefer profiles table which stores email -> user_id mapping
  const { data, error } = await admin.from('profiles').select('user_id').eq('email', email).maybeSingle();
  if (error) console.error('profiles lookup error', email, error.message);
  return data?.user_id ?? null;
}

async function ensureUser(email: string, password: string, full_name: string): Promise<string> {
  // Try to create the user (idempotent - if exists we'll look it up)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  });

  if (created?.user?.id) return created.user.id;

  if (createErr) {
    // Already exists or other issue - find by email via profiles mapping first
    const existingViaProfile = await getUserIdByEmail(email);
    if (existingViaProfile) return existingViaProfile;

    // Fallback: scan users (small set, acceptable for demos)
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;
    const found = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      // Ensure password stays as expected for demo (reset)
      await admin.auth.admin.updateUserById(found.id, { password });
      return found.id;
    }
  }
  throw new Error(`Unable to ensure user for ${email}`);
}

async function ensureProfileAndRole(user_id: string, email: string, full_name: string, role: AppRole, department?: string) {
  // Profile: insert or update to approved
  const { data: existingProfile } = await admin.from('profiles').select('id, approval_status').eq('user_id', user_id).maybeSingle();
  if (!existingProfile) {
    await admin.from('profiles').insert({
      user_id,
      email,
      full_name,
      department: department ?? null,
      approval_status: 'approved',
      is_verified: true,
    });
  } else {
    await admin.from('profiles').update({
      email,
      full_name,
      department: department ?? null,
      approval_status: 'approved',
      is_verified: true,
    }).eq('user_id', user_id);
  }

  // Role: upsert unique (user_id, role)
  await admin.from('user_roles')
    .upsert({ user_id, role }, { onConflict: 'user_id,role' });

  // Role-specific minimal profile rows (insert if missing)
  if (role === 'staff') {
    const { data } = await admin.from('faculty_profiles').select('id').eq('user_id', user_id).maybeSingle();
    if (!data) await admin.from('faculty_profiles').insert({ user_id, department: department ?? null });
  } else if (role === 'student') {
    const { data } = await admin.from('student_profiles').select('id').eq('user_id', user_id).maybeSingle();
    if (!data) await admin.from('student_profiles').insert({ user_id, department: department ?? null, year_of_study: 1 });
  } else if (role === 'parent') {
    const { data } = await admin.from('parent_profiles').select('id').eq('user_id', user_id).maybeSingle();
    if (!data) await admin.from('parent_profiles').insert({ user_id });
  } else if (role === 'support') {
    const { data } = await admin.from('support_profiles').select('id').eq('user_id', user_id).maybeSingle();
    if (!data) await admin.from('support_profiles').insert({ user_id });
  } else if (role === 'admin' || role === 'super_admin') {
    const { data } = await admin.from('admin_profiles').select('id').eq('user_id', user_id).maybeSingle();
    if (!data) await admin.from('admin_profiles').insert({ user_id, role_title: role === 'super_admin' ? 'Super Admin' : 'Admin' });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const results: Record<string, string> = {};
    for (const a of accounts) {
      const userId = await ensureUser(a.email, a.password, a.full_name);
      await ensureProfileAndRole(userId, a.email, a.full_name, a.role, a.department);
      results[a.email] = 'ok';
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.error('setup-demo-accounts error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
