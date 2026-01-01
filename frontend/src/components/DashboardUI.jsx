import React from 'react';
import { 
  Clock, CheckCircle, AlertTriangle, Upload, 
  History, ExternalLink, X, Send, MessageCircle, 
  Save, RefreshCw, MessageSquare, Loader2
} from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';
import AttendanceCalendar from './AttendanceCalendar';

const DashboardUI = ({ 
  user, 
  stats, 
  status, 
  logs, 
  loading,
  // Form States
  tasks, setTasks,
  doubts, setDoubts,
  proofFile, proofUrl, uploading,
  // Modals & Chat
  isRemarkModalOpen, setIsRemarkModalOpen,
  remarkDate, remarkText, setRemarkText, savingRemark,
  isChatOpen, setIsChatOpen,
  // Actions
  handleCheckIn, 
  handleCheckOut, 
  handleFileUpload, 
  fetchDashboardData,
  openRemarkModal,
  saveRemark,
  getStatusColor
}) => {

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
        <p className="mt-4 text-gray-500 font-medium">Syncing your progress...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 relative max-w-6xl mx-auto">
      
      {/* 📝 REMARK MODAL */}
      {isRemarkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add Reason / Note</h3>
              <button onClick={() => setIsRemarkModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">Date: <span className="font-mono font-bold text-gray-700">{remarkDate}</span></p>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
              rows="4"
              placeholder="e.g. Sick Leave, Internet Issue, Late start..."
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsRemarkModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={saveRemark} disabled={savingRemark} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                {savingRemark ? 'Saving...' : <><Save className="h-4 w-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="ml-8 md:ml-0">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, <span className="font-semibold text-indigo-600">{user?.full_name}</span>!
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
           <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
             {stats?.today?.hours || 0} hrs Today
           </div>
           <button onClick={fetchDashboardData} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
             <RefreshCw className="h-5 w-5" />
           </button>
        </div>
      </div>

      {/* 2. ACTION CENTER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-2 h-full ${
            status === 'In Progress' ? 'bg-blue-500' : 
            status === 'Completed' ? 'bg-green-500' : 
            status === 'Forgot Checkout' ? 'bg-yellow-500' : 'bg-gray-300'
        }`}></div>

        <div className="p-8 ml-2">
          {!status && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                 <Clock className="h-10 w-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Start Your Session</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">"Consistency is what transforms average into excellence."</p>
              <button onClick={handleCheckIn} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:-translate-y-1 transition-transform">
                Start Tracking ⏱️
              </button>
            </div>
          )}

          {status === 'In Progress' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800">
                <div className="h-3 w-3 bg-blue-500 rounded-full animate-ping"></div>
                <span className="font-semibold">Session Active. Timer is running...</span>
              </div>
              <form onSubmit={handleCheckOut} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Task Report</label>
                    <textarea required value={tasks} onChange={(e) => setTasks(e.target.value)} rows="5" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="What topics did you cover today?" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Doubts (Optional)</label>
                    <input type="text" value={doubts} onChange={(e) => setDoubts(e.target.value)} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Any concepts you didn't understand?" />
                  </div>
                </div>
                <div className="space-y-6 flex flex-col justify-between">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Upload Work Proof</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition relative">
                      {proofFile ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                           <CheckCircle className="w-6 h-6" />
                           <span className="font-medium truncate max-w-[200px]">{proofFile.name}</span>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <Upload className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Click to upload Screenshot / PDF</p>
                        </div>
                      )}
                      <input type="file" onChange={handleFileUpload} accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                    </div>
                    {uploading && <p className="text-xs text-indigo-600 mt-2 text-center font-medium animate-pulse">Uploading...</p>}
                    {proofUrl && !uploading && <p className="text-xs text-green-600 mt-2 text-center font-medium">Uploaded!</p>}
                  </div>
                  <button type="submit" disabled={uploading} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                    <Clock className="w-5 h-5" /> End Session
                  </button>
                </div>
              </form>
            </div>
          )}

          {status === 'Completed' && (
            <div className="text-center py-6">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle className="h-8 w-8 text-green-600" />
               </div>
               <h3 className="text-xl font-bold text-gray-800">You're done for the day!</h3>
               <p className="text-gray-500">Rest up and come back stronger tomorrow.</p>
            </div>
          )}

          {status === 'Forgot Checkout' && (
            <div className="text-center py-6">
               <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="h-8 w-8 text-yellow-600" />
               </div>
               <h3 className="text-xl font-bold text-gray-800">Session Auto-Closed</h3>
               <p className="text-gray-500 max-w-md mx-auto">You forgot to checkout yesterday. Please be careful next time.</p>
               <button onClick={handleCheckIn} className="mt-4 text-indigo-600 font-medium hover:underline">Start New Session</button>
            </div>
          )}
        </div>
      </div>

      {/* 3. ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-96"><AnalyticsChart logs={logs} /></div>
        <div className="h-96"><AttendanceCalendar logs={logs} /></div>
      </div>

      {/* 4. ACTIVITY HISTORY TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Recent Activity History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Task Details</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">My Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No history found. Start your first session!</td>
                </tr>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {log.duration_hours ? `${log.duration_hours} hrs` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 min-w-[200px] whitespace-pre-wrap">
                      {log.tasks || <span className="text-gray-300 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded max-w-[150px] truncate ${log.remarks && log.remarks !== '-' ? 'bg-yellow-50 text-gray-700 border border-yellow-200' : 'text-gray-300'}`}>
                            {log.remarks && log.remarks !== '-' ? log.remarks : 'None'}
                          </span>
                          <button onClick={() => openRemarkModal(log)} className="p-1 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded transition" title="Add Reason">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.proof_url ? (
                        <a href={log.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-100">
                          <ExternalLink className="h-3 w-3" /> View
                        </a>
                      ) : <span className="text-xs text-gray-400">-</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 💬 FLOATING CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 mb-4 flex flex-col overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-bold text-sm">Admin Support</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:text-gray-200"><X className="h-4 w-4"/></button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto space-y-3">
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-600 max-w-[80%] border border-gray-100">
                  Hello! How can I help you today?
                </div>
              </div>
              <div className="flex justify-center">
                 <span className="text-xs text-gray-400">Today, 10:00 AM</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
              <button className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
        </button>
      </div>

    </div>
  );
};

export default DashboardUI;
