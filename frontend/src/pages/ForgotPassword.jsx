import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    try {
      setLoading(true);
      // Backend call to send email
      await api.post('/auth/forgot-password', { email });
      
      // Success UI state
      setEmailSent(true);
      toast.success("Reset link sent to your email! 📧");
    } catch (error) {
      // Security practice: Don't tell if email exists or not, but for debugging/UX we show error
      toast.error(error.response?.data?.message || "Failed to send link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header Icon */}
        <div className="text-center mb-8">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="text-gray-500 mt-2 text-sm">
            No worries! Enter your email and we'll send you a reset instructions.
          </p>
        </div>

        {!emailSent ? (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your registered email"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
            </button>
          </form>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center bg-green-50 p-6 rounded-xl border border-green-100">
            <h3 className="text-green-800 font-bold text-lg mb-2">Check your mail 📧</h3>
            <p className="text-green-700 text-sm">
              We have sent a password recover instructions to <span className="font-bold">{email}</span>.
            </p>
            <p className="text-xs text-gray-400 mt-4">Did not receive email? Check spam folder.</p>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium transition">
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;