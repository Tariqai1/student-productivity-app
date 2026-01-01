import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  // 1. State ab Parent ke paas hai (Remote Control)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* 2. Sidebar ko Controls Pass Karein */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* 3. Main Content Wrapper 
          - lg:ml-64: Laptop par left side 256px jagah chodega (Sidebar ke liye).
          - w-full: Mobile par full width lega (Squish nahi hoga).
      */}
      <div className="flex-1 w-full lg:ml-64 transition-all duration-300 relative">
        
        {/* Mobile Header (Hamburger Menu) 
            - lg:hidden: Laptop par ye gayab rahega.
            - sticky top-0: Scroll karne par bhi upar chipka rahega.
        */}
        <header className="bg-white h-16 px-4 flex items-center gap-3 shadow-sm lg:hidden sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition active:scale-95"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-gray-800 tracking-tight">StudentApp</span>
        </header>

        {/* Page Content (Where Dashboard/Profile renders) */}
        <main className="p-4 md:p-8 overflow-y-auto min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <div className="max-w-7xl mx-auto animate-fadeIn">
             {/* Outlet represents the current page (Dashboard, Profile, etc.) */}
             <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default Layout;
