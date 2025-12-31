import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { 
  User, Mail, Phone, MapPin, BookOpen, Camera, 
  Save, Loader2, Edit2, X, Award, Shield, CheckCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewImage, setViewImage] = useState(null); // For Full Screen Modal
  
  const [stats, setStats] = useState({ total_hours: 0, total_sessions: 0 });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    course: '',
    mentor_name: '', // 👈 New Field
    role: '',        // Read Only
    is_active: true, // Read Only
    image: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Profile Details
      const { data } = await api.get('/students/me');
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        username: data.username || '',
        phone: data.phone || '',
        address: data.address || '',
        course: data.course || '',
        mentor_name: data.mentor_name || '', // 👈 Fetch Mentor
        role: data.role || 'student',
        is_active: data.is_active !== false, // Default true
        image: data.image || ''
      });

      // 2. Fetch My Stats (Total Hours)
      const statsRes = await api.get('/analytics/my-performance');
      if(statsRes.data?.lifetime) {
        setStats({
          total_hours: statsRes.data.lifetime.hours || 0,
          total_sessions: statsRes.data.lifetime.sessions || 0
        });
      }

    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Backend call to update details
      await api.put('/students/me', {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        course: formData.course,
        mentor_name: formData.mentor_name // 👈 Send Mentor Update
      });
      
      toast.success("Profile Updated Successfully! 🎉");
      setIsEditing(false);
      
      // Update Context to reflect changes instantly in Sidebar/Header
      if (user) {
        // setUser({ ...user, full_name: formData.full_name, image: formData.image }); 
      }
    } catch (error) {
      toast.error("Update failed. Try again.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (Max 5MB)");
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploading(true);
      const { data } = await api.post('/students/upload-photo', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, image: data.image_url }));
      toast.success("New Profile Photo Set! 📸");
      
    } catch (error) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-10 relative">
      
      {/* 🖼️ FULL IMAGE MODAL */}
      {viewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <button 
            onClick={() => setViewImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
          >
            <X className="h-8 w-8" />
          </button>
          <img 
            src={viewImage} 
            alt="Full Profile" 
            className="max-h-[90vh] max-w-full rounded-lg shadow-2xl border-4 border-white/10"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information and account settings.</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition shadow-sm ${
            isEditing 
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 transform'
          }`}
        >
          {isEditing ? <><X className="h-4 w-4"/> Cancel Edit</> : <><Edit2 className="h-4 w-4"/> Edit Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. LEFT CARD: Photo & Identity */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
            
            {/* Image Wrapper */}
            <div className="relative group z-10 mb-4">
              <div 
                className="h-36 w-36 rounded-full overflow-hidden border-4 border-white shadow-xl cursor-pointer bg-gray-100"
                onClick={() => formData.image && setViewImage(formData.image)}
              >
                {formData.image ? (
                  <img src={formData.image} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-indigo-300 text-5xl font-bold bg-indigo-50">
                    {formData.full_name.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Camera Upload Button */}
              {isEditing && (
                <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg transition transform hover:scale-110">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900">{formData.full_name}</h2>
            <p className="text-gray-500 text-sm font-medium mb-3">@{formData.username}</p>

            {/* Badges */}
            <div className="flex gap-2 justify-center mb-6">
               <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100 flex items-center gap-1">
                 <Shield className="h-3 w-3" /> {formData.role}
               </span>
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1 ${formData.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                 {formData.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {formData.is_active ? 'Active' : 'Inactive'}
               </span>
            </div>

            {/* Quick Stats */}
            <div className="w-full grid grid-cols-2 gap-2 border-t border-gray-100 pt-6">
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Hours</p>
                <p className="text-xl font-bold text-indigo-600">{stats.total_hours}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Sessions</p>
                <p className="text-xl font-bold text-gray-800">{stats.total_sessions}</p>
              </div>
            </div>
          </div>

          {/* Read-Only Account Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
             <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-2">Account Credentials</h3>
             <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span className="truncate flex-1">{formData.email}</span>
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-500">Read-Only</span>
             </div>
          </div>
        </div>

        {/* 2. RIGHT CARD: Editable Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-full relative">
            
            {/* Form Section Header */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
               <User className="h-5 w-5 text-indigo-600"/>
               <h3 className="text-xl font-bold text-gray-800">Personal Details</h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
                  <div className={`relative transition-all ${isEditing ? 'opacity-100' : 'opacity-70'}`}>
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Phone Number</label>
                  <div className={`relative transition-all ${isEditing ? 'opacity-100' : 'opacity-70'}`}>
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:cursor-not-allowed"
                      placeholder="+91..."
                    />
                  </div>
                </div>

                {/* Course */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Course / Stream</label>
                  <div className={`relative transition-all ${isEditing ? 'opacity-100' : 'opacity-70'}`}>
                    <BookOpen className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.course}
                      onChange={(e) => setFormData({...formData, course: e.target.value})}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Mentor Name (NEW) */}
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Assigned Mentor</label>
                  <div className={`relative transition-all ${isEditing ? 'opacity-100' : 'opacity-70'}`}>
                    <Award className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.mentor_name}
                      onChange={(e) => setFormData({...formData, mentor_name: e.target.value})}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition disabled:cursor-not-allowed"
                      placeholder="e.g. Sir Zaid"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="group md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Location / Address</label>
                  <div className={`relative transition-all ${isEditing ? 'opacity-100' : 'opacity-70'}`}>
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition disabled:cursor-not-allowed"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="pt-8 flex justify-end animate-fadeIn border-t border-gray-100 mt-6">
                  <button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Save className="h-5 w-5" /> Save Changes
                  </button>
                </div>
              )}

              {!isEditing && (
                <div className="pt-10 text-center">
                    <p className="text-gray-400 text-sm italic bg-gray-50 py-2 rounded-lg inline-block px-4">Click "Edit Profile" button to make changes.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;