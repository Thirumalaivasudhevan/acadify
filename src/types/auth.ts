export type UserRole = 'Faculty' | 'Student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Faculty' | 'Student';
  active: boolean;
  createdAt: string;
  deptId?: string;
  rollNo?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string, role: 'Faculty' | 'Student') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}