import axios from 'axios';

// Base URL set karein
const api = axios.create({
  baseURL: 'https://student-productivity-app-lzvy.onrender.com', // Apna backend URL check karein
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔒 Request Interceptor (Ye har request se pehle chalega)
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

export default api;
