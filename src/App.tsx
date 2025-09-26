import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <DashboardLayout>{children}</DashboardLayout> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Admin Routes */}
      {user.role === 'Admin' && (
        <>
          <Route path="/" element={<Navigate to="/admin/faculty" />} />
          <Route path="/admin/faculty" element={<ProtectedRoute><FacultyList /></ProtectedRoute>} />
          <Route path="/admin/timetable/:facultyId" element={<ProtectedRoute><FacultyTimetable /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><UsersManagement /></ProtectedRoute>} />
        </>
      )}

      {/* Faculty Routes */}
      {user.role === 'Faculty' && (
        <>
          <Route path="/" element={<Navigate to="/faculty/timetable" />} />
          <Route path="/faculty/timetable" element={<ProtectedRoute><MyTimetable /></ProtectedRoute>} />
          <Route path="/faculty/works" element={<ProtectedRoute><AssignWorks /></ProtectedRoute>} />
          <Route path="/faculty/announcements" element={<ProtectedRoute><FacultyAnnouncements /></ProtectedRoute>} />
          <Route path="/faculty/requests" element={<ProtectedRoute><FacultyRequests /></ProtectedRoute>} />
        </>
      )}

      {/* Student Routes */}
      {user.role === 'Student' && (
        <>
          <Route path="/" element={<Navigate to="/student/timetable" />} />
          <Route path="/student/timetable" element={<ProtectedRoute><StudentTimetable /></ProtectedRoute>} />
          <Route path="/student/works" element={<ProtectedRoute><MyWorks /></ProtectedRoute>} />
          <Route path="/student/announcements" element={<ProtectedRoute><StudentAnnouncements /></ProtectedRoute>} />
          <Route path="/student/requests" element={<ProtectedRoute><StudentRequests /></ProtectedRoute>} />
        </>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
