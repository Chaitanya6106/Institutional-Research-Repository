import React, { useState } from 'react';
import { Check, X, ShieldAlert, Users, FolderCheck, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [pendingPapers, setPendingPapers] = useState([
    { id: 101, title: 'Smart Grid Load Balancing using RL', author: 'Dr. Prof. Sharma', dept: 'Electronics', date: '2026-03-24' },
    { id: 102, title: 'Blockchain Based Academic Credentials', author: 'Student Mehra', dept: 'Computer', date: '2026-03-25' },
  ]);

  const handleApprove = (id) => {
    setPendingPapers(prev => prev.filter(p => p.id !== id));
    alert(`Paper #${id} Approved and Published!`);
  };

  const handleReject = (id) => {
    setPendingPapers(prev => prev.filter(p => p.id !== id));
    alert(`Paper #${id} Rejected.`);
  };

  // Chart data setup
  const chartData = {
    labels: ['Computer', 'Electronics', 'Mechanical', 'Civil', 'AI & ML'],
    datasets: [
      {
        label: 'Approved Papers',
        data: [420, 280, 210, 144, 200],
        backgroundColor: '#4f46e5',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-amber-500" /> Admin Moderation Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review pending paper uploads and manage repository statistics.</p>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> Publications by Department
        </h2>
        <div className="h-64">
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Pending Approval Queue */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FolderCheck className="w-5 h-5 text-amber-500" /> Pending Approvals ({pendingPapers.length})
        </h2>

        {pendingPapers.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No pending papers in the approval queue.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingPapers.map((paper) => (
              <div key={paper.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">{paper.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Submitted by: {paper.author}</span>
                    <span>•</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{paper.dept}</span>
                    <span>•</span>
                    <span>Date: {paper.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(paper.id)}
                    className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(paper.id)}
                    className="flex items-center gap-1 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <X className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
