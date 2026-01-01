import axios from 'axios';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------
// 1. CONFIGURATION (Best Practice)
// ----------------------------------------------------------------------
// Production URL (Render)
const PROD_URL = 'https://student-productivity-app-lzvy.onrender.com/api/v1';

// Localhost URL (Testing ke liye)
// const LOCAL_URL = 'http://127.0.0.1:8000/api/v1'; 

// Filhal Production URL use kar rahe hain (Deploy ke liye yahi chahiye)
const BASE_URL = PROD_URL; 

// ----------------------------------------------------------------------
// 2. AXIOS INSTANCE CREATE
// ----------------------------------------------------------------------
const api = axios.create({
  baseURL: BASE_URL, // ✅ Correct Syntax: camelCase 'baseURL' aur colon ':'
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 15 seconds ka timeout (Render free tier slow hota hai isliye)
});

// ----------------------------------------------------------------------
// 3. REQUEST INTERCEPTOR (Token Attach Karna)
// ----------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Browser se token nikalo
    const token = localStorage.getItem('token');
    
    // Agar token hai, toh Header mein jod do
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ----------------------------------------------------------------------
// 4. RESPONSE INTERCEPTOR (Global Error Handling)
// ----------------------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    // Agar response sahi hai (200 OK), toh data return karo
    return response;
  },
  (error) => {
    // A. Network Error / Server Down
    if (!error.response) {
      toast.error("Network Error! Check your internet connection.");
    }

    // B. Session Expired (401 Unauthorized)
    // Agar token purana ho gaya hai, toh user ko logout karo
    if (error.response && error.response.status === 401) {
      // Sirf tab logout karein agar hum login page par NA ho
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error("Session Expired. Please Login Again.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
