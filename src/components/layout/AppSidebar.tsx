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
  Home,
  Brain,
  Newspaper,
  Bot,
} from 'lucide-react';

const navigationItems = {
  Admin: [
    { title: 'Dashboard', url: '/admin/dashboard', icon: Home },
    { title: 'Manage Departments', url: '/admin/departments', icon: Settings },
    { title: 'Manage Faculty', url: '/admin/faculty', icon: Users },
    { title: 'Manage Students', url: '/admin/students', icon: GraduationCap },
    { title: 'Analytics', url: '/admin/analytics', icon: Clock },
  ],
  Faculty: [
    { title: 'My Timetable', url: '/faculty/timetable', icon: Calendar },
    { title: 'Assign Works', url: '/faculty/works', icon: ClipboardList },
    { title: 'Attendance', url: '/faculty/attendance', icon: UserCheck },
    { title: 'Announcements', url: '/faculty/announcements', icon: Megaphone },
    { title: 'Requests', url: '/faculty/requests', icon: MessageSquare },
  ],
  Student: [
    { title: 'Dashboard', url: '/student/dashboard', icon: Home },
    { title: 'Daily Quiz', url: '/student/quiz', icon: Brain },
    { title: 'Department News', url: '/student/news', icon: Newspaper },
    { title: 'AI Assistant', url: '/student/ai-chat', icon: Bot },
    { title: 'My Timetable', url: '/student/timetable', icon: Calendar },
    { title: 'My Works', url: '/student/works', icon: BookOpen },
    { title: 'My Attendance', url: '/student/attendance', icon: UserCheck },
    { title: 'Announcements', url: '/student/announcements', icon: Megaphone },
    { title: 'Requests', url: '/student/requests', icon: MessageSquare },
  ],
  Parent: [
    { title: 'Dashboard', url: '/parent/dashboard', icon: Home },
    { title: 'Children', url: '/parent/children', icon: Users },
    { title: 'Fees', url: '/parent/fees', icon: FileText },
    { title: 'Attendance', url: '/parent/attendance', icon: UserCheck },
    { title: 'Leave Requests', url: '/parent/leave', icon: MessageSquare },
  ],
  Support: [
    { title: 'Dashboard', url: '/support/dashboard', icon: Home },
    { title: 'Tickets', url: '/support/tickets', icon: MessageSquare },
    { title: 'Organizations', url: '/support/organizations', icon: Settings },
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
                {user.role === 'Parent' && 'Parent Portal'}
                {user.role === 'Support' && 'Support Team'}
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};