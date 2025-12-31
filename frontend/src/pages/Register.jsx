import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  User, Mail, Lock, BookOpen, 
  ArrowRight, Loader2, UserPlus, Users 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    course: '',
    reference: '' // Optional Field
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend call
      // Note: 'reference' backend me save nahi hoga jab tak hum backend model update na karein.
      // Abhi ke liye hum required fields bhej rahe hain.
      await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        course: formData.course
      });

      toast.success("Account Created Successfully! 🎉");
      navigate('/login');
      
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Branding/Image */}
        <div className="hidden md:flex flex-col justify-center items-center bg-indigo-600 text-white p-10 w-1/3 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90"></div>
          <div className="relative z-10 text-center">
            <div className="bg-white/20 p-4 rounded-full inline-block mb-6 backdrop-blur-sm">
              <UserPlus className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Join Us!</h2>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Start your productivity journey today. Track attendance, manage tasks, and grow consistently.
            </p>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 text-sm mt-1">Please fill in your details to register.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Reference (Optional) */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Reference (Optional)</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="e.g. Zaid Ibrahim (Senior)"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="e.g. Muhammad Rayyan"
                  required 
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="e.g. rayyan.ahmed@gmail.com"
                  required 
                />
              </div>
            </div>

            {/* Username */}
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="e.g. rayyan_dev"
                  required 
                />
              </div>
            </div>

            {/* Course (Backend Requirement) */}
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Course / Stream</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="e.g. B.Tech CS / Python"
                  required 
                />
              </div>
            </div>

            {/* Password */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
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
            <div className="col-span-1 md:col-span-2 mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="h-5 w-5" /></>}
              </button>
            </div>

          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;