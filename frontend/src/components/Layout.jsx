import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Fixed */}
      <Sidebar />
      
      {/* Main Content (Pushed right by w-72 which is 18rem) */}
      <main className="flex-1 ml-72 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;