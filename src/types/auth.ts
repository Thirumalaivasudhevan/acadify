export type AppRole = 'master_owner' | 'super_admin' | 'admin' | 'staff' | 'student' | 'parent' | 'support';
export type UserRole = 'MasterOwner' | 'SuperAdmin' | 'Faculty' | 'Student' | 'Admin' | 'Parent' | 'Support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  deptId?: string;
  rollNo?: string;
  organizationId?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  isVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string, role: AppRole, department?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApprovalRequest {
  id: string;
  user_id: string;
  approver_id?: string;
  requested_role: AppRole;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string;
    email: string;
    department?: string;
  };
}
