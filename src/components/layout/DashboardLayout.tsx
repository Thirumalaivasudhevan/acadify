import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarProvider } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-animated">
        <DashboardHeader />
        
        <div className="flex w-full">
          <AppSidebar />
          
          <main className="flex-1 p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;