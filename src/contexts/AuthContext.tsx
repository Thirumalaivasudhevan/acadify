import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    active: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Dr. John Smith',
    email: 'faculty@example.com',
    role: 'Faculty',
    active: true,
    createdAt: '2024-01-01',
    deptId: '1',
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'student@example.com',
    role: 'Student',
    active: true,
    createdAt: '2024-01-01',
    deptId: '1',
    rollNo: 'CS001',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('college_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication
    const foundUser = mockUsers.find(u => u.email === email);
    const validPasswords: Record<string, string> = {
      'admin@example.com': 'admin123',
      'faculty@example.com': 'faculty123',
      'student@example.com': 'student123',
    };
    
    if (foundUser && validPasswords[email] === password) {
      setUser(foundUser);
      localStorage.setItem('college_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('college_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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