import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';
import {
  Users,
  Calendar,
  Megaphone,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Settings,
  UserCheck,
  FileText,
  Clock,
  GraduationCap,
} from 'lucide-react';

const navigationItems = {
  Admin: [
    { title: 'Faculty List', url: '/admin/faculty', icon: Users },
    { title: 'Faculty Timetable', url: '/admin/timetable', icon: Calendar },
    { title: 'Announcements', url: '/admin/announcements', icon: Megaphone },
    { title: 'Users Management', url: '/admin/users', icon: UserCheck },
  ],
  Faculty: [
    { title: 'My Timetable', url: '/faculty/timetable', icon: Calendar },
    { title: 'Assign Works', url: '/faculty/works', icon: ClipboardList },
    { title: 'Announcements', url: '/faculty/announcements', icon: Megaphone },
    { title: 'Requests', url: '/faculty/requests', icon: MessageSquare },
  ],
  Student: [
    { title: 'My Timetable', url: '/student/timetable', icon: Calendar },
    { title: 'My Works', url: '/student/works', icon: BookOpen },
    { title: 'Announcements', url: '/student/announcements', icon: Megaphone },
    { title: 'Requests', url: '/student/requests', icon: MessageSquare },
  ],
};

export const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  
  if (!user) return null;

  const items = navigationItems[user.role] || [];
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={isCollapsed ? "w-[72px]" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-sidebar-foreground">{user.role}</h2>
                <p className="text-xs text-sidebar-foreground/70">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`
                      transition-all duration-200 hover-lift
                      ${isActive(item.url) 
                        ? 'bg-sidebar-accent text-sidebar-primary border-l-2 border-primary' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }
                    `}
                  >
                    <Link to={item.url} className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <div className="mt-auto p-4">
            <div className="glass p-3 rounded-lg">
              <h4 className="font-medium text-sm text-sidebar-foreground">
                Welcome, {user.name.split(' ')[0]}!
              </h4>
              <p className="text-xs text-sidebar-foreground/70 mt-1">
                {user.role === 'Student' && user.rollNo && `Roll: ${user.rollNo}`}
                {user.role === 'Faculty' && 'Faculty Member'}
                {user.role === 'Admin' && 'Administrator'}
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};