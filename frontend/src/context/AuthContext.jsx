import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

// Create the Context
export const AuthContext = createContext();

// Create the Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is logged in (On Page Load)
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Token hai, backend se user details mango
      const { data } = await api.get("/students/me");
      setUser(data);
    } catch (error) {
      console.error("Session expired or invalid token", error);
      
      // ⚠️ IMPORTANT: Agar 401 error aaye (Token Expired), toh logout karo
      logout(); 
    } finally {
      setLoading(false);
    }
  };

  // 2. Login Function (Connects with Login.jsx)
  // Note: Login.jsx API call karta hai, yeh function bas state update karta hai
  const loginSuccess = (userData) => {
    setUser(userData);
  };

  // 3. Logout Function (Robust)
  const logout = () => {
    localStorage.removeItem("token"); // Token hatao
    setUser(null); // State clear karo
    setLoading(false);
    
    // ⚠️ Force Redirect to Login Page (Agar hum pehle se wahan nahi hain)
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login'; 
      toast.error("Session expired. Please login again.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, loginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};