import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/auth/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";

// Admin Pages
import FacultyList from "./pages/admin/FacultyList";
import FacultyTimetable from "./pages/admin/FacultyTimetable";
import AdminAnnouncements from "./pages/admin/Announcements";
import UsersManagement from "./pages/admin/Users";

// Faculty Pages  
import MyTimetable from "./pages/faculty/MyTimetable";
import AssignWorks from "./pages/faculty/AssignWorks";
import FacultyAnnouncements from "./pages/faculty/FacultyAnnouncements";
import FacultyRequests from "./pages/faculty/FacultyRequests";

// Student Pages
import StudentTimetable from "./pages/student/StudentTimetable";
import MyWorks from "./pages/student/MyWorks";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import StudentRequests from "./pages/student/StudentRequests";

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        {/* Admin Routes */}
        {user.role === 'Admin' && (
          <>
            <Route path="/" element={<Navigate to="/admin/faculty" />} />
            <Route path="/admin/faculty" element={<FacultyList />} />
            <Route path="/admin/timetable/:facultyId" element={<FacultyTimetable />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/users" element={<UsersManagement />} />
          </>
        )}

        {/* Faculty Routes */}
        {user.role === 'Faculty' && (
          <>
            <Route path="/" element={<Navigate to="/faculty/timetable" />} />
            <Route path="/faculty/timetable" element={<MyTimetable />} />
            <Route path="/faculty/works" element={<AssignWorks />} />
            <Route path="/faculty/announcements" element={<FacultyAnnouncements />} />
            <Route path="/faculty/requests" element={<FacultyRequests />} />
          </>
        )}

        {/* Student Routes */}
        {user.role === 'Student' && (
          <>
            <Route path="/" element={<Navigate to="/student/timetable" />} />
            <Route path="/student/timetable" element={<StudentTimetable />} />
            <Route path="/student/works" element={<MyWorks />} />
            <Route path="/student/announcements" element={<StudentAnnouncements />} />
            <Route path="/student/requests" element={<StudentRequests />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </DashboardLayout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;
