import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/auth/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Faculty Pages  
import MyTimetable from "./pages/faculty/MyTimetable";
import AssignWorks from "./pages/faculty/AssignWorks";
import AttendancePage from "./pages/faculty/AttendancePage";
import FacultyAnnouncements from "./pages/faculty/FacultyAnnouncements";
import FacultyRequests from "./pages/faculty/FacultyRequests";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import QuizPage from "./pages/student/QuizPage";
import NewsPage from "./pages/student/NewsPage";
import AIChatPage from "./pages/student/AIChatPage";
import StudentTimetable from "./pages/student/StudentTimetable";
import MyWorks from "./pages/student/MyWorks";
import MyAttendance from "./pages/student/MyAttendance";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import StudentRequests from "./pages/student/StudentRequests";

// Parent Pages
import ParentDashboard from "./pages/parent/ParentDashboard";

// Support Pages
import SupportDashboard from "./pages/support/SupportDashboard";

// Shared Pages
import ProfilePage from "./pages/ProfilePage";

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-animated">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route - Always available, not wrapped in DashboardLayout */}
      <Route path="/login" element={<LoginPage />} />

      {/* All other routes wrapped in DashboardLayout */}
      <Route path="*" element={
        <DashboardLayout>
          <Routes>
            {/* Root redirect based on current role */}
            <Route path="/" element={
              <Navigate to={
                user?.role === 'Admin' ? '/admin/dashboard' :
                user?.role === 'Faculty' ? '/faculty/timetable' :
                user?.role === 'Student' ? '/student/dashboard' :
                user?.role === 'Parent' ? '/parent/dashboard' :
                user?.role === 'Support' ? '/support/dashboard' :
                '/student/dashboard'
              } />
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Faculty Routes */}
            <Route path="/faculty/timetable" element={<MyTimetable />} />
            <Route path="/faculty/works" element={<AssignWorks />} />
            <Route path="/faculty/attendance" element={<AttendancePage />} />
            <Route path="/faculty/announcements" element={<FacultyAnnouncements />} />
            <Route path="/faculty/requests" element={<FacultyRequests />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/quiz" element={<QuizPage />} />
            <Route path="/student/news" element={<NewsPage />} />
            <Route path="/student/ai-chat" element={<AIChatPage />} />
            <Route path="/student/timetable" element={<StudentTimetable />} />
            <Route path="/student/works" element={<MyWorks />} />
            <Route path="/student/attendance" element={<MyAttendance />} />
            <Route path="/student/announcements" element={<StudentAnnouncements />} />
            <Route path="/student/requests" element={<StudentRequests />} />

            {/* Parent Routes */}
            <Route path="/parent/dashboard" element={<ParentDashboard />} />

            {/* Support Routes */}
            <Route path="/support/dashboard" element={<SupportDashboard />} />

            {/* Shared Routes */}
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="*" element={<Navigate to="/student/dashboard" />} />
          </Routes>
        </DashboardLayout>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;