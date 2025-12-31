import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Users, CheckCircle, XCircle, AlertTriangle, 
  Calendar, Search, RefreshCw, 
  ArrowRight, MessageSquare, X, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

// 👇 Import the new component
import AdminQuickActions from '../components/AdminQuickActions';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // --- States ---
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0, present: 0, absent: 0, forgotCheckout: 0, active: 0
  });

  // Modal State for Remarks
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null); // { id, name }
  const [remarkText, setRemarkText] = useState('');
  const [updatingRemark, setUpdatingRemark] = useState(false);

  useEffect(() => {
    fetchDailyReport();
  }, [selectedDate]);

  // --- API Calls ---

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/daily-report?date=${selectedDate}`);
      setReport(data);
      calculateStats(data);
    } catch (error) {
      console.error("Failed to fetch report", error);
      toast.error("Failed to load daily report");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const active = data.filter(s => s.status.includes('In Progress')).length;
    const completed = data.filter(s => s.status === 'Present' || s.status === 'Completed').length;
    const forgot = data.filter(s => s.status.includes('Forgot')).length;
    const absent = data.filter(s => s.status === 'Absent').length;
    
    setStats({
      total: data.length,
      present: completed,
      active: active,
      absent: absent,
      forgotCheckout: forgot
    });
  };

  // --- Remark Logic ---

  const openRemarkModal = (student) => {
    setCurrentStudent({ id: student.student_id, name: student.name });
    setRemarkText(student.remarks === '-' ? '' : student.remarks);
    setIsModalOpen(true);
  };

  const saveRemark = async () => {
    if (!currentStudent) return;
    try {
      setUpdatingRemark(true);
      await api.post('/admin/student-remark', {
        student_id: currentStudent.id,
        date: selectedDate,
        remark: remarkText || "-" // If empty, save as dash
      });
      
      toast.success("Reason updated!");
      setIsModalOpen(false);
      fetchDailyReport(); // Refresh table to show new remark
    } catch (error) {
      toast.error("Failed to save remark");
    } finally {
      setUpdatingRemark(false);
    }
  };

  // --- Helpers ---
  
  const getStatusStyle = (status) => {
    if (status === 'Present' || status === 'Completed') return 'bg-green-100 text-green-700 border-green-200';
    if (status.includes('In Progress')) return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
    if (status === 'Absent') return 'bg-red-50 text-red-600 border-red-100 font-medium';
    if (status.includes('Forgot')) return 'bg-yellow-100 text-yellow-700 border-yellow-200 font-bold';
    return 'bg-gray-100 text-gray-600';
  };

  const filteredReport = report.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* 📝 REMARK MODAL (Popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Reason / Remark</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Why is <span className="font-bold text-indigo-600">{currentStudent?.name}</span> absent or incomplete?
            </p>

            <textarea
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
              rows="4"
              placeholder="e.g. Sick Leave, Family Emergency, Internet Issue..."
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={saveRemark}
                disabled={updatingRemark}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                {updatingRemark ? 'Saving...' : <><Save className="h-4 w-4" /> Save Note</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview for <span className="font-semibold text-indigo-600">{selectedDate === new Date().toISOString().split('T')[0] ? "Today" : selectedDate}</span>
          </p>
        </div>
        
        {/* 🔥 NEW: Quick Actions Component (Streamlit, Daily, Weekly) */}
        <div className="flex flex-wrap items-center gap-3">
          
          <AdminQuickActions selectedDate={selectedDate} />

          {/* Divider */}
          <div className="h-10 w-[1px] bg-gray-300 mx-2 hidden md:block"></div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
            />
          </div>

          <button onClick={fetchDailyReport} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-300 transition shadow-sm" title="Refresh Data">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Students" value={stats.total} icon={<Users />} color="gray" />
        <StatCard title="Active Now" value={stats.active} icon={<RefreshCw className="animate-spin" />} color="blue" />
        <StatCard title="Completed" value={stats.present} icon={<CheckCircle />} color="green" />
        <StatCard title="Forgot Checkout" value={stats.forgotCheckout} icon={<AlertTriangle />} color="yellow" />
        <StatCard title="Absent" value={stats.absent} icon={<XCircle />} color="red" />
      </div>

      {/* 3. MAIN REPORT TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search student by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 font-medium">Loading live data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timing</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason / Remarks</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredReport.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 flex flex-col items-center">
                      <Users className="h-10 w-10 text-gray-200 mb-2" />
                      No students found for this date.
                    </td>
                  </tr>
                ) : (
                  filteredReport.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50/80 transition duration-150">
                      
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm mr-3 border border-indigo-100 overflow-hidden">
                             {student.image ? (
                               <img src={student.image} alt="Avatar" className="h-full w-full object-cover" />
                             ) : (
                               student.name.charAt(0)
                             )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500">@{student.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(student.status)}`}>
                          {student.status}
                        </span>
                      </td>

                      {/* Timing */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.status === 'Absent' ? (
                          <span className="text-gray-300">-</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {student.check_in !== '-' && <span className="text-green-700 text-xs font-medium">In: {student.check_in}</span>}
                            {student.check_out !== '-' && <span className="text-red-600 text-xs font-medium">Out: {student.check_out}</span>}
                          </div>
                        )}
                      </td>

                      {/* 📝 REMARKS COLUMN */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded max-w-[150px] truncate ${
                            student.remarks !== '-' ? 'bg-yellow-50 text-gray-700 border border-yellow-200' : 'text-gray-400'
                          }`}>
                            {student.remarks !== '-' ? student.remarks : 'No remarks'}
                          </span>
                          <button 
                            onClick={() => openRemarkModal(student)}
                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title="Edit Reason"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => navigate(`/admin/student/${student.student_id}`)}
                          className="group inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
                        >
                          Analyze <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition duration-200">
    <div className={`self-start p-3 rounded-xl bg-${color}-50 text-${color}-600 mb-3`}>
      {icon}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">{title}</p>
    </div>
  </div>
);

export default AdminDashboard;