import React from 'react';
import api from '../api/axios';
import { Download, FileText, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminQuickActions = ({ selectedDate }) => {

  // 1. External Link (Streamlit)
  const handleOpenStreamlit = () => {
    window.open("https://student-update-system.streamlit.app/", "_blank");
  };

  // 2. Download Daily
  const handleDownloadDaily = async () => {
    try {
      toast.loading("Downloading Daily Report...");
      const response = await api.get(`/admin/download-daily-report?date=${selectedDate}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Daily_Report_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success("Daily Report Downloaded! 📥");
    } catch (error) {
      toast.dismiss();
      toast.error("Download failed");
    }
  };

  // 3. Download Weekly (New Feature)
  const handleDownloadWeekly = async () => {
    try {
      toast.loading("Generating Weekly Report (7 Days)...");
      const response = await api.get(`/admin/download-weekly-report`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Weekly_Report_Last7Days.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success("Weekly Report Downloaded! 📊");
    } catch (error) {
      toast.dismiss();
      toast.error("Weekly download failed");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      
      {/* Button 1: Streamlit Link */}
      <button 
        onClick={handleOpenStreamlit}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 transition transform hover:-translate-y-0.5"
      >
        <ExternalLink className="h-4 w-4" /> Live System
      </button>

      {/* Button 2: Daily Report */}
      <button 
        onClick={handleDownloadDaily}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-200 transition transform hover:-translate-y-0.5"
      >
        <Download className="h-4 w-4" /> Daily CSV
      </button>

      {/* Button 3: Weekly Report */}
      <button 
        onClick={handleDownloadWeekly}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5"
      >
        <FileText className="h-4 w-4" /> Weekly CSV
      </button>

    </div>
  );
};

export default AdminQuickActions;