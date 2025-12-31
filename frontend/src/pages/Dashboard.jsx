import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

// 👇 Import UI Component
import DashboardUI from '../components/DashboardUI';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  // --- Dashboard States ---
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);

  // --- Check-Out Form States ---
  const [tasks, setTasks] = useState('');
  const [doubts, setDoubts] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState('');

  // --- Remark Modal States ---
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [remarkDate, setRemarkDate] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [savingRemark, setSavingRemark] = useState(false);

  // --- Chat Widget States ---
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsRes = await api.get('/analytics/my-performance');
      setStats(statsRes.data);

      const historyRes = await api.get('/attendance/my-history');
      setLogs(historyRes.data);

      // 👇 Check Status Logic Updated
      checkTodayStatus(historyRes.data);
      
    } catch (error) {
      console.error("Dashboard Sync Failed", error);
      toast.error("Could not sync dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ FIX: Smart Status Check
  const checkTodayStatus = (historyLogs) => {
    if (!historyLogs || historyLogs.length === 0) {
      setStatus(null);
      return;
    }

    // Aaj ki taareekh (Browser Local Time)
    const todayString = new Date().toDateString();

    // List mein se 'Aaj' ka log dhundho
    const todayLog = historyLogs.find(log => 
      new Date(log.date).toDateString() === todayString
    );

    if (todayLog) {
      // Agar aaj ka log mil gaya, toh uska status set karo
      if (todayLog.status === 'In Progress') {
        setStatus('In Progress'); // Yahan Check-Out form dikhega
      } else if (todayLog.status === 'Completed') {
        setStatus('Completed');
      } else if (todayLog.status.includes('Forgot')) {
        setStatus('Forgot Checkout');
      } else {
        // Fallback for Absent or other statuses
        setStatus(null);
      }
    } else {
      // Agar aaj ka koi log nahi mila
      setStatus(null);
    }
  };

  // --- Action Handlers ---

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/check-in');
      toast.success("🔥 Session Started! Focus Mode On.");
      setStatus('In Progress');
      fetchDashboardData(); 
    } catch (error) {
      // 🛠️ Fallback: Agar backend bole "Already Checked In", toh frontend ko force update karo
      if (error.response?.status === 400 && error.response?.data?.detail?.includes("already checked in")) {
         toast.success("Session Restored! You are already checked in.");
         setStatus('In Progress');
      } else {
         toast.error(error.response?.data?.detail || "Check-in failed");
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large! Max 5MB allowed.");
      return;
    }

    setProofFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const { data } = await api.post('/attendance/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProofUrl(data.url);
      toast.success("Proof uploaded successfully! 📎");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload proof. Try again.");
      setProofFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    if (!tasks || tasks.length < 5) {
      toast.error("Please enter a valid task description.");
      return;
    }
    try {
      await api.post('/attendance/check-out', {
        tasks,
        proof_url: proofUrl,
        doubts
      });
      toast.success("🎉 Session Completed! Great work today.");
      setStatus('Completed');
      setTasks('');
      setDoubts('');
      setProofFile(null);
      setProofUrl('');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Check-out failed");
    }
  };

  const openRemarkModal = (log) => {
    const dateObj = new Date(log.date);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    setRemarkDate(dateStr);
    setRemarkText(log.remarks && log.remarks !== '-' ? log.remarks : '');
    setIsRemarkModalOpen(true);
  };

  const saveRemark = async () => {
    try {
      setSavingRemark(true);
      await api.post('/students/remark', {
        date: remarkDate,
        remark: remarkText
      });
      toast.success("Reason/Remark Updated!");
      setIsRemarkModalOpen(false);
      fetchDashboardData(); 
    } catch (error) {
      toast.error("Failed to save remark");
    } finally {
      setSavingRemark(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Completed' || status === 'Present') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'Forgot Checkout') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'Absent') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <DashboardUI 
      user={user}
      stats={stats}
      status={status}
      logs={logs}
      loading={loading}
      
      tasks={tasks} setTasks={setTasks}
      doubts={doubts} setDoubts={setDoubts}
      proofFile={proofFile} proofUrl={proofUrl} uploading={uploading}
      
      isRemarkModalOpen={isRemarkModalOpen} setIsRemarkModalOpen={setIsRemarkModalOpen}
      remarkDate={remarkDate} remarkText={remarkText} setRemarkText={setRemarkText} savingRemark={savingRemark}
      isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen}
      
      handleCheckIn={handleCheckIn}
      handleCheckOut={handleCheckOut}
      handleFileUpload={handleFileUpload}
      fetchDashboardData={fetchDashboardData}
      openRemarkModal={openRemarkModal}
      saveRemark={saveRemark}
      getStatusColor={getStatusColor}
    />
  );
};

export default Dashboard;