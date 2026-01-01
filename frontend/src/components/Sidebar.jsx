import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, UserCircle, LogOut,
  ShieldCheck, BookOpen, GraduationCap, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'My Profile', path: '/profile', icon: <UserCircle className="w-5 h-5" /> },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* 1. MOBILE OVERLAY (Backdrop)
        Only visible on mobile (lg:hidden) when isOpen is true.
        Closes sidebar when clicked.
      */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 2. SIDEBAR CONTAINER 
        - Fixed position on left.
        - Mobile: Hidden by default (-translate-x-full), slides in when isOpen.
        - Desktop (lg): Always visible (translate-x-0) and static.
      */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 shadow-2xl lg:shadow-none`}
      >
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 tracking-tight leading-tight">StudentApp</h1>
              <p className="text-[10px] text-gray-500 font-medium">Productivity Portal</p>
            </div>
          </div>
          
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="lg:hidden p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-bold text-gray-400 uppercase px-4 mb-2 tracking-wider">Main Menu</p>

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile when link clicked
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

        {/* User Profile (Bottom) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden shrink-0">
              {user?.image ? (
                <img src={user.image} alt="User" className="h-full w-full object-cover" />
              ) : (
                user?.full_name?.charAt(0).toUpperCase() || <UserCircle className="w-6 h-6" />
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-gray-800 truncate">{user?.full_name || 'User'}</h4>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                {user?.role === 'admin' ? <ShieldCheck className="w-3 h-3 text-green-600" /> : <GraduationCap className="w-3 h-3 text-blue-500" />}
                <span className="capitalize">{user?.role || 'Guest'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-gray-600 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
