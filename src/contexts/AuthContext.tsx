import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, AppRole } from '../types/auth';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ⚠️ TEMPORARY: Preview mode for testing all pages without authentication
const PREVIEW_MODE = true;
const mockUser: User = {
  id: 'preview-user',
  name: 'Preview User',
  email: 'preview@demo.com',
  role: 'Student', // Change to preview different roles: 'Admin', 'Faculty', 'Student', 'Parent', 'Support'
  active: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(PREVIEW_MODE ? mockUser : null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(!PREVIEW_MODE);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  useEffect(() => {
    // Skip auth setup in preview mode
    if (PREVIEW_MODE) {
      setIsLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*, user_roles(role)')
                .eq('user_id', session.user.id)
                .single();
                
              if (profile) {
                const status = profile.approval_status as 'pending' | 'approved' | 'rejected';
                setApprovalStatus(status || 'pending');
                
                // Only set user if approved
                if (status === 'approved') {
                  // Fetch role separately to ensure data consistency
                  const { data: userRoles } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', session.user.id)
                    .limit(1)
                    .single();
                  
                  const primaryRole = userRoles?.role as AppRole;
                  
                  // Security: Don't fallback to default role - throw error if role is invalid
                  if (!primaryRole) {
                    console.error('User has no role assigned');
                    setUser(null);
                    setApprovalStatus(null);
                    return;
                  }

                  const roleMap: Record<AppRole, User['role']> = {
                    'master_owner': 'MasterOwner',
                    'super_admin': 'SuperAdmin',
                    'admin': 'Admin',
                    'staff': 'Faculty',
                    'student': 'Student',
                    'parent': 'Parent',
                    'support': 'Support',
                  };
                  
                  const mappedRole = roleMap[primaryRole];
                  if (!mappedRole) {
                    console.error('Invalid role:', primaryRole);
                    setUser(null);
                    setApprovalStatus(null);
                    return;
                  }
                  
                  const userData: User = {
                    id: profile.user_id,
                    name: profile.full_name,
                    email: profile.email,
                    role: mappedRole,
                    active: true,
                    createdAt: profile.created_at,
                    approvalStatus: status,
                    isVerified: profile.is_verified,
                  };
                  setUser(userData);
                } else {
                  setUser(null);
                }
              }
            } catch (error) {
              setIsLoading(false);
            }
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setApprovalStatus(null);
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setIsLoading(false);
      return false;
    }
    
    return true;
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole, institutionCode: string, department?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Client-side password validation
      if (password.length < 12) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 12 characters' };
      }
      
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(password)) {
        setIsLoading(false);
        return { success: false, error: 'Password must contain uppercase, lowercase, number, and special character' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        let organizationId: string | null = null;

        // Handle institution code
        if (role === 'super_admin') {
          // SuperAdmin creates a new institution
          const { data: existingOrg } = await supabase
            .from('organizations')
            .select('id')
            .eq('institution_code', institutionCode)
            .single();

          if (existingOrg) {
            setIsLoading(false);
            return { success: false, error: 'Institution code already exists. Please choose a different code.' };
          }

          const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: fullName + "'s Institution",
              email: email,
              institution_code: institutionCode,
            })
            .select('id')
            .single();

          if (orgError || !newOrg) {
            setIsLoading(false);
            return { success: false, error: 'Failed to create institution' };
          }

          organizationId = newOrg.id;
        } else {
          // Other roles must use existing institution code
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('institution_code', institutionCode)
            .single();

          if (orgError || !org) {
            setIsLoading(false);
            return { success: false, error: 'Invalid institution code. Please check with your institution.' };
          }

          organizationId = org.id;
        }

        // Use atomic database function for secure signup
        const { data: result, error: dbError } = await supabase.rpc('create_user_with_approval', {
          p_user_id: data.user.id,
          p_full_name: fullName,
          p_email: email,
          p_role: role as any,
          p_department: department
        });

        if (dbError) {
          setIsLoading(false);
          return { success: false, error: 'Failed to create account' };
        }

        const dbResult = result as { success: boolean; error?: string };
        if (!dbResult.success) {
          setIsLoading(false);
          return { success: false, error: dbResult.error || 'Failed to create account' };
        }

        // Update profile with organization_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ organization_id: organizationId })
          .eq('user_id', data.user.id);

        if (profileError) {
          setIsLoading(false);
          return { success: false, error: 'Failed to link to institution' };
        }
      }
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = () => {
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, isLoading, approvalStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};