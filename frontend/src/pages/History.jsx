import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Clock, FileText, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Backend se history data mangwana
      const { data } = await api.get('/attendance/my-history');
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading history...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Calendar className="h-6 w-6 text-primary" />
        Attendance History
      </h2>

      {logs.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
          No records found yet. Start by checking in!
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Done</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition">
                    
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(log.date).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status === 'Completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {log.status}
                      </span>
                    </td>

                    {/* Timings */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>IN: {new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      {log.check_out_time && (
                        <div>OUT: {new Date(log.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      )}
                    </td>

                    {/* Tasks (Tooltip idea can be added later, for now simple text) */}
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.tasks}>
                      {log.tasks || "-"}
                    </td>

                    {/* Proof Link */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      {log.proof_link ? (
                        <a href={log.proof_link} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                          View <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;