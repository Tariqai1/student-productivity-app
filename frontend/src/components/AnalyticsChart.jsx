import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

const AnalyticsChart = ({ logs }) => {
  
  // 🧠 Data Processing Logic
  // Hum pichle 7 din ka data prepare karenge (Last 7 Days)
  const processData = () => {
    const data = [];
    const today = startOfDay(new Date());

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayLabel = format(date, 'EEE'); // Mon, Tue...
      
      // Find log for this day
      // Note: Backend se 'duration_hours' aa raha hai (Check attendance.py update)
      const log = logs.find(l => isSameDay(new Date(l.date), date));
      
      data.push({
        name: dayLabel,
        hours: log ? (log.duration_hours || 0) : 0, // Agar data nahi hai to 0
        date: format(date, 'MMM dd'),
        status: log?.status || 'Absent'
      });
    }
    return data;
  };

  const chartData = processData();

  // 🎨 Custom Tooltip Design
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 text-white p-3 rounded-lg text-xs shadow-xl">
          <p className="font-bold mb-1">{data.date}</p>
          <p>Hours: <span className="font-mono text-green-400">{data.hours} hrs</span></p>
          <p className="capitalize text-gray-400">{data.status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full">
      <div className="mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Weekly Performance</h3>
        <p className="text-sm text-gray-500">Last 7 Days Productivity Trend</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={40}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.hours >= 4 ? '#4f46e5' : entry.hours > 0 ? '#818cf8' : '#e5e7eb'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;