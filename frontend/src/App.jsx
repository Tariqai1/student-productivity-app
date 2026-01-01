import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 🔐 Context
import { AuthProvider, AuthContext } from './context/AuthContext';

// 🎨 Components
// 👇 Import the NEW Layout (Yeh UI aur Responsiveness sambhalega)
import Layout from './components/Layout'; 

// 📄 Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentView from './pages/AdminStudentView';

// --- 🛡️ 1. SMART LAYOUT WRAPPER ---
// Yeh check karega ki user login hai ya nahi.
const ProtectedLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  
  // Security Check: Agar user nahi hai, to Login pe bhejo
  if (!user) return <Navigate to="/login" replace />;

  // ✅ FIX: Pehle yahan hardcoded div tha jo mobile view kharab kar raha tha.
  // Ab hum 'Layout' component use kar rahe hain jo Desktop/Mobile dono handle karega.
  return <Layout />;
};

// --- 🛡️ 2. ADMIN GUARD ---
const AdminRoute = () => {
  const { user } = useContext(AuthContext);
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// --- 🚀 MAIN APP CONFIGURATION ---
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global Notifications */}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

        <Routes>
          {/* --- PUBLIC ROUTES (No Sidebar) --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* --- PROTECTED ROUTES (Sidebar Automatic Aayega) --- */}
          <Route element={<ProtectedLayout />}>
            
            {/* Common Routes */}
            <Route path="/profile" element={<Profile />} />

            {/* Student Route */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin Specific Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/student/:studentId" element={<AdminStudentView />} />
            </Route>

          </Route>

          {/* Unknown Route Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
