import React, { useState } from 'react';
import { Upload, FileText, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' or 'upload'
  
  const [submissions, setSubmissions] = useState([
    { id: 1, title: 'AI based Smart Parking Management System', status: 'Approved', feedback: '', date: '2026-03-10' },
    { id: 2, title: 'Autonomous Drone Navigation using CNN', status: 'Changes Requested', feedback: 'Please update the abstract to include more details about the CNN architecture used. Also fix citations on page 4.', date: '2026-03-20' },
    { id: 3, title: 'IoT Weather Forecasting Station', status: 'Pending Review', feedback: '', date: '2026-03-25' }
  ]);

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    alert("Paper successfully submitted to faculty for review!");
    setActiveTab('submissions');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
      case 'Changes Requested':
        return <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full"><AlertCircle className="w-3.5 h-3.5" /> Changes Requested</span>;
      case 'Pending Review':
        return <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> Pending Review</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Student Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Submit your research papers for faculty review and track publication status.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'submissions' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Submissions
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'upload' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Submit New Paper
        </button>
      </div>

      {activeTab === 'submissions' && (
        <div className="grid gap-4">
          {submissions.map(paper => (
            <div key={paper.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">{paper.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Submitted on {paper.date}</p>
                </div>
                {getStatusBadge(paper.status)}
              </div>
              
              {paper.status === 'Changes Requested' && paper.feedback && (
                <div className="mt-4 bg-rose-50 p-4 rounded-lg border border-rose-100">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                    <MessageSquare className="w-4 h-4" /> Faculty Feedback
                  </h4>
                  <p className="text-sm text-rose-700 leading-relaxed">{paper.feedback}</p>
                  <button className="mt-3 text-xs bg-white border border-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-100 transition shadow-sm">
                    Re-upload Corrected File
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'upload' && (
        <form onSubmit={handleUploadSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" /> Submit Paper for Review
          </h2>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Paper Title</label>
            <input type="text" required placeholder="Enter complete title" className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assigned Faculty Guide</label>
            <select required className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              <option value="">Select Faculty...</option>
              <option value="Dr. Sharma">Dr. Sharma</option>
              <option value="Prof. Kulkarni">Prof. Kulkarni</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Abstract</label>
            <textarea rows="4" required placeholder="Paste your abstract here..." className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">PDF Document</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Click to browse or drag PDF here</p>
              <p className="text-xs text-slate-400 mt-1">Maximum file size: 25MB</p>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md mt-4">
            Submit to Faculty
          </button>
        </form>
      )}
    </div>
  );
}
