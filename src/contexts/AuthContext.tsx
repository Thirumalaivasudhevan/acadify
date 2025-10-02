import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, AppRole } from '../types/auth';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  useEffect(() => {
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
                  const roleMap: Record<AppRole, User['role']> = {
                    'super_admin': 'Admin',
                    'admin': 'Admin',
                    'staff': 'Faculty',
                    'student': 'Student',
                    'parent': 'Parent',
                    'support': 'Support',
                  };
                  
                  const userData: User = {
                    id: profile.user_id,
                    name: profile.full_name,
                    email: profile.email,
                    role: roleMap[primaryRole] || 'Student',
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

  const signUp = async (email: string, password: string, fullName: string, role: AppRole, department?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
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
        // Map AppRole to the old role enum for backward compatibility
        const roleMap: Record<AppRole, Database['public']['Enums']['user_role']> = {
          'super_admin': 'Admin',
          'admin': 'Admin',
          'staff': 'Faculty',
          'student': 'Student',
          'parent': 'Parent',
          'support': 'Support',
        };
        
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName,
            email: email,
            role: roleMap[role],
            department: department,
            approval_status: 'pending',
            is_verified: false,
          });
          
        if (profileError) {
          setIsLoading(false);
          return { success: false, error: 'Failed to create profile' };
        }

        // Create user role record
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role,
          });

        if (roleError) {
          setIsLoading(false);
          return { success: false, error: 'Failed to assign role' };
        }

        // Create approval request
        const { error: approvalError } = await supabase
          .from('approval_requests')
          .insert({
            user_id: data.user.id,
            requested_role: role,
            status: 'pending',
          });

        if (approvalError) {
          setIsLoading(false);
          return { success: false, error: 'Failed to create approval request' };
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