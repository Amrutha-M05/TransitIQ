import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public
import Landing from './pages/public/Landing';
import DelayBoard from './pages/public/DelayBoard';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Passenger
import AICompanion from './pages/passenger/AICompanion';
import PassengerDashboard from './pages/passenger/Dashboard';
import SubmitFeedback from './pages/passenger/SubmitFeedback';
import ReportDelay from './pages/passenger/ReportDelay';
import MySubmissions from './pages/passenger/MySubmissions';
import Profile from './pages/passenger/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import ManageRoutes from './pages/admin/ManageRoutes';
import ManageStops from './pages/admin/ManageStops';
import ManageBuses from './pages/admin/ManageBuses';
import ManageFeedback from './pages/admin/ManageFeedback';
import ManageDelays from './pages/admin/ManageDelays';
import ManageUsers from './pages/admin/ManageUsers';

// Layout
import Layout from './components/Layout';

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/delays" element={<DelayBoard />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
        <Route path="/reset-password/:token" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />

      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/dashboard" element={<PassengerDashboard />} />
        <Route path="/ai-companion" element={<AICompanion />} />
        <Route path="/feedback/new" element={<SubmitFeedback />} />
        <Route path="/delay/new" element={<ReportDelay />} />
        <Route path="/my-submissions" element={<MySubmissions />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<Protected adminOnly><Layout /></Protected>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/routes" element={<ManageRoutes />} />
        <Route path="/admin/stops" element={<ManageStops />} />
        <Route path="/admin/buses" element={<ManageBuses />} />
        <Route path="/admin/feedback" element={<ManageFeedback />} />
        <Route path="/admin/delays" element={<ManageDelays />} />
        <Route path="/admin/users" element={<ManageUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
