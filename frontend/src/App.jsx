import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 🔐 Context
import { AuthProvider, AuthContext } from './context/AuthContext';

// 🎨 Components
import Sidebar from './components/Sidebar';

// 📄 Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword'; // ✅ Preserved
import ResetPassword from './pages/ResetPassword';   // ✅ Preserved
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentView from './pages/AdminStudentView';

// --- 🛡️ 1. SMART LAYOUT (Sidebar + Security) ---
// Yeh component check karega ki user login hai ya nahi.
// Agar login hai -> Sidebar dikhayega aur content (Outlet) load karega.
// Agar nahi -> Login page par bhej dega.
const ProtectedLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  
  // Security Check
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Fixed Left (Ek baar load hoga, baar baar nahi) */}
      <Sidebar />
      
      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto h-full">
        <Outlet /> {/* 👈 Yahan par pages automatically change honge */}
      </div>
    </div>
  );
};

// --- 🛡️ 2. ADMIN GUARD ---
// Sirf Admin ko allow karega, Students ko bahar nikal dega.
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
            
            {/* Common Routes (Student & Admin) */}
            <Route path="/profile" element={<Profile />} />

            {/* Student Route (Default) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin Specific Routes (Secured) */}
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