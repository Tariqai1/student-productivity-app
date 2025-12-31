import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  ArrowLeft, FileText, ExternalLink, AlertTriangle, 
  X, Maximize2, Calendar, Clock, 
  Mail, Phone, MapPin, BookOpen, User, Shield, 
  CheckCircle, XCircle, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

// 📊 Components
import AttendanceCalendar from '../components/AttendanceCalendar';
import AnalyticsChart from '../components/AnalyticsChart';

const AdminStudentView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 🖼️ Image Modal State
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch History
      const historyRes = await api.get(`/admin/attendance/${studentId}`);
      setLogs(historyRes.data);

      // 2. Fetch Stats
      const statsRes = await api.get(`/analytics/admin/student-stats/${studentId}`);
      setStats(statsRes.data);

      // 3. Fetch Student Basic Info
      // Note: Ideally, create a specific endpoint /admin/student/{id}/profile if list is not enough
      const studentsRes = await api.get('/admin/students');
      const currentStudent = studentsRes.data.find(s => s._id === studentId);
      setStudent(currentStudent);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Completed' || status === 'Present') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'Forgot Checkout') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'Absent') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-gray-100 text-gray-600';
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading Analysis...</div>;

  return (
    <div className="space-y-8 pb-10 relative">
      
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
            alt="Full View" 
            className="max-h-[90vh] max-w-full rounded-lg shadow-2xl border-4 border-white/10"
          />
        </div>
      )}

      {/* 1. Header & Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin-dashboard')}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Analysis</h1>
          <p className="text-gray-500 text-sm">Deep dive tracking for <span className="font-semibold text-indigo-600">{student?.full_name || 'Student'}</span></p>
        </div>
      </div>

      {/* 2. ✨ PREMIUM STUDENT PROFILE CARD ✨ */}
      {student && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          {/* Decorative Top Bar */}
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="p-8 flex flex-col lg:flex-row gap-8">
            
            {/* Left: Avatar & Basic Identity */}
            <div className="flex flex-col items-center lg:items-start space-y-4 min-w-[200px] border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-8">
               <div className="relative group cursor-pointer" onClick={() => setViewImage(student.image || null)}>
                <div className="h-32 w-32 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white shadow-lg overflow-hidden ring-1 ring-gray-100">
                   {student.image ? (
                     <img src={student.image} alt="Profile" className="h-full w-full object-cover" />
                   ) : (
                     student.full_name?.charAt(0)
                   )}
                </div>
                {student.image && (
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="text-white h-8 w-8" />
                  </div>
                )}
                
                {/* Active Status Dot */}
                <div className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white ${student.is_active !== false ? 'bg-green-500' : 'bg-gray-400'}`} title={student.is_active !== false ? 'Active Account' : 'Inactive'}></div>
              </div>

              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
                <p className="text-gray-500 font-medium text-sm">@{student.username}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200 uppercase tracking-wide">
                   <Shield className="h-3 w-3" /> {student.role || 'Student'}
                </div>
              </div>
            </div>

            {/* Right: Detailed Info Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
               
               {/* Email */}
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                   <Mail className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                   <p className="text-gray-800 font-medium">{student.email || <span className="text-gray-300 italic">Not provided</span>}</p>
                 </div>
               </div>

               {/* Phone */}
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                   <Phone className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                   <p className="text-gray-800 font-medium">{student.phone || <span className="text-gray-300 italic">N/A</span>}</p>
                 </div>
               </div>

               {/* Course */}
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                   <BookOpen className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Course / Stream</p>
                   <p className="text-gray-800 font-medium">{student.course || <span className="text-gray-300 italic">N/A</span>}</p>
                 </div>
               </div>

               {/* Location */}
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                   <MapPin className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</p>
                   <p className="text-gray-800 font-medium">{student.address || <span className="text-gray-300 italic">Not set</span>}</p>
                 </div>
               </div>

               {/* Mentor (New Field) */}
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                   <Award className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Mentor</p>
                   <p className="text-gray-800 font-medium">{student.mentor_name || <span className="text-gray-300 italic">None</span>}</p>
                 </div>
               </div>

               {/* Account Status */}
               <div className="flex items-start gap-3">
                 <div className={`p-2 rounded-lg ${student.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {student.is_active !== false ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</p>
                   <p className={`font-bold ${student.is_active !== false ? 'text-emerald-700' : 'text-red-700'}`}>
                     {student.is_active !== false ? 'Active' : 'Deactivated'}
                   </p>
                 </div>
               </div>

            </div>

            {/* Far Right: Total Stats */}
            <div className="flex flex-row lg:flex-col gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 justify-center lg:justify-start">
               <div className="text-center p-3 bg-gray-50 rounded-xl min-w-[100px]">
                  <p className="text-2xl font-bold text-indigo-600">{stats?.all_time?.total_hours || 0}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Hours</p>
               </div>
               <div className="text-center p-3 bg-gray-50 rounded-xl min-w-[100px]">
                  <p className="text-2xl font-bold text-gray-800">{stats?.all_time?.total_sessions || 0}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">Sessions</p>
               </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. Visual Analysis (Graphs & Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-96">
          <AnalyticsChart logs={logs} />
        </div>
        <div className="h-96">
          <AttendanceCalendar logs={logs} />
        </div>
      </div>

      {/* 4. Detailed History Table */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
             <h3 className="font-bold text-gray-800 text-lg">Activity Logs & Proofs</h3>
             <p className="text-xs text-gray-500">Detailed breakdown of daily tasks and uploads.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Timing</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider w-1/3">Task Report</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                    No activity records found for this student.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/80 transition duration-150 group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.date).toLocaleDateString('en-IN', { year: 'numeric', weekday: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full border ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="text-sm text-gray-700 font-mono">
                         {log.duration_hours ? (
                           <span className="flex items-center gap-1">
                             <Clock className="h-3 w-3 text-gray-400" /> {log.duration_hours} hrs
                           </span>
                         ) : '-'}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-w-[300px]">
                        {log.tasks || <span className="text-gray-300 italic">-</span>}
                      </div>
                      {log.doubts && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 inline-block font-medium">
                          <AlertTriangle className="h-3 w-3 inline mr-1" /> 
                          Doubt: {log.doubts}
                        </div>
                      )}
                    </td>
                     <td className="px-6 py-5">
                      {log.remarks ? (
                        <span className="text-xs font-medium text-gray-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 block max-w-[150px]">
                          {log.remarks}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {log.proof_url ? (
                        <button 
                          onClick={() => setViewImage(log.proof_url)} 
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-100 hover:scale-105 transition transform"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 italic font-medium">No Upload</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentView;