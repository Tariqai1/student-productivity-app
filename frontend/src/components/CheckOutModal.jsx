import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

const CheckOutModal = ({ isOpen, onClose, onSubmit }) => {
  const [tasks, setTasks] = useState('');
  const [doubts, setDoubts] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Send data back to Dashboard
    await onSubmit({ tasks, doubts, proof_link: link });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            📝 Daily Report
          </h3>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* 1. Tasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What did you achieve today? *
            </label>
            <textarea
              required
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
              placeholder="Example: Completed React Login page, Fixed Navbar bugs..."
            ></textarea>
          </div>

          {/* 2. Doubts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              Any Doubts or Blockers?
              <span className="text-xs text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <AlertCircle className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <textarea
                value={doubts}
                onChange={(e) => setDoubts(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-red-500 outline-none h-20 resize-none bg-red-50"
                placeholder="Example: I am stuck on API connection..."
              ></textarea>
            </div>
          </div>

          {/* 3. Proof Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proof of Work (Link) *
            </label>
            <input
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://github.com/..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              {loading ? 'Submitting...' : (
                <>
                  Submit Report <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CheckOutModal;