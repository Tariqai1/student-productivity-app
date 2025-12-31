import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, UserCircle, LogOut, 
  ShieldCheck, BookOpen, GraduationCap 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/login');
  };

  // --- Dynamic Links Based on Role ---
  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'My Profile', path: '/profile', icon: <UserCircle className="w-5 h-5" /> },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    // Admin ko khud ki profile dekhne ki zaroorat kam hoti hai, par option rakh sakte hain
    // { name: 'Admin Profile', path: '/profile', icon: <UserCircle className="w-5 h-5" /> }, 
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-30 shadow-sm">
      
      {/* 1. App Logo / Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-gray-900 tracking-tight">StudentApp</h1>
          <p className="text-xs text-gray-500 font-medium">Productivity Portal</p>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <div className="flex-1 py-6 px-4 space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-2 tracking-wider">Main Menu</p>
        
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm translate-x-1' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      {/* 3. User Profile Snippet (Bottom) */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          {/* Dynamic Avatar */}
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden">
             {user?.image ? (
               <img src={user.image} alt="User" className="h-full w-full object-cover" />
             ) : (
               user?.full_name?.charAt(0) || <UserCircle className="w-6 h-6" />
             )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-gray-800 truncate">{user?.full_name || 'User'}</h4>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {user?.role === 'admin' ? <ShieldCheck className="w-3 h-3 text-green-600" /> : <GraduationCap className="w-3 h-3 text-blue-500" />}
              <span className="capitalize">{user?.role || 'Guest'}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-gray-600 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

    </div>
  );
};

export default Sidebar;