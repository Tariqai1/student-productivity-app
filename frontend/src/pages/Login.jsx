import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { LogIn, User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // Context update karne ke liye
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🛠️ FIX 1: Convert to Form Data for FastAPI OAuth2
      // FastAPI expects 'application/x-www-form-urlencoded', NOT JSON.
      const params = new URLSearchParams();
      params.append('username', formData.username);
      params.append('password', formData.password);

      const response = await api.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // 1. Save Token
      localStorage.setItem('token', response.data.access_token);
      
      // 2. Update Context (Optional: Fetch profile immediately or reload)
      // Filhal hum window reload karenge taaki context fresh data utha le
      toast.success("Login Successful! 🚀");
      
      // Thoda delay taaki toast dikhe
      setTimeout(() => {
        window.location.href = '/dashboard'; 
      }, 500);

    } catch (error) {
      console.error("Login Error:", error);

      // 🛠️ FIX 2: Handle Pydantic Error Objects (Prevent React Crash)
      const errorDetail = error.response?.data?.detail;
      
      if (Array.isArray(errorDetail)) {
        // Agar Pydantic validation error array hai
        toast.error(errorDetail[0].msg || "Invalid Input Data");
      } else if (typeof errorDetail === 'object') {
        // Agar koi aur object hai
        toast.error("An error occurred. Please try again.");
      } else {
        // Agar simple string hai
        toast.error(errorDetail || "Login Failed. Check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Image/Branding */}
        <div className="hidden md:flex flex-col justify-center items-center bg-indigo-600 text-white p-10 w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800 opacity-90"></div>
          <div className="relative z-10 text-center">
            <div className="bg-white/20 p-4 rounded-full inline-block mb-6 backdrop-blur-sm">
              <LogIn className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Welcome Back!</h2>
            <p className="text-indigo-100 text-sm leading-relaxed px-4">
              Access your dashboard, track your progress, and stay consistent with your goals.
            </p>
          </div>
          {/* Decor */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="Enter username"
                  required 
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Login <ArrowRight className="h-5 w-5" /></>}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;