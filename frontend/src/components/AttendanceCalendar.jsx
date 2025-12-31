import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styling
import { format, isSameDay, isBefore, startOfDay } from 'date-fns';

const AttendanceCalendar = ({ logs }) => {
  
  // 🎨 Color Logic Helper
  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return null;

    const today = startOfDay(new Date());
    const checkDate = startOfDay(date);

    // 1. Find log for this specific date
    const log = logs.find(l => isSameDay(new Date(l.date), date));

    // Case A: Future Dates (Ignore)
    if (checkDate > today) return 'opacity-50';

    // Case B: Log Found (Present)
    if (log) {
      if (log.status === 'Completed') return 'react-calendar-tile-green'; // Present
      if (log.status === 'Forgot Checkout') return 'react-calendar-tile-yellow'; // Warning
      if (log.status === 'In Progress') return 'react-calendar-tile-blue'; // Active
    }

    // Case C: No Log Found & Past Date (Absent)
    // (Excluding Sundays optional, abhi strict mode hai to Sunday bhi count hoga)
    if (!log && isBefore(checkDate, today)) {
      return 'react-calendar-tile-red';
    }

    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Attendance Tracker</h3>
        
        {/* Legend (Color Guide) */}
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Present</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Incomplete</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Absent</div>
        </div>
      </div>

      <div className="custom-calendar-wrapper">
        <Calendar
          tileClassName={getTileClassName}
          className="w-full border-none"
        />
      </div>

      {/* CSS Injection for Custom Colors */}
      <style>{`
        .react-calendar { width: 100%; border: none; font-family: inherit; }
        .react-calendar__tile { height: 50px; border-radius: 8px; font-size: 12px; font-weight: 500; }
        .react-calendar__tile--now { background: transparent; color: black; border: 1px solid #6366f1; }
        .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #f3f4f6; }
        
        /* Custom Status Colors */
        .react-calendar-tile-green { background-color: #dcfce7 !important; color: #166534 !important; }
        .react-calendar-tile-yellow { background-color: #fef9c3 !important; color: #854d0e !important; }
        .react-calendar-tile-blue { background-color: #dbeafe !important; color: #1e40af !important; border: 1px solid #3b82f6; }
        .react-calendar-tile-red { background-color: #fee2e2 !important; color: #991b1b !important; }
      `}</style>
    </div>
  );
};

export default AttendanceCalendar;