import React, { useState } from 'react';
import { Upload, Plus, FileText, Check, X, MessageSquare, AlertCircle } from 'lucide-react';

export default function FacultyPortal() {
  const [activeTab, setActiveTab] = useState('review'); // 'review' or 'upload'
  
  // Pending reviews state
  const [pendingReviews, setPendingReviews] = useState([
    { id: 1, title: 'Smart Energy Management System using ML', student: 'Alex Sharma', date: '2026-03-24' },
    { id: 2, title: 'Blockchain for Academic Records', student: 'Rohan Mehra', date: '2026-03-25' },
  ]);

  const [feedback, setFeedback] = useState({});

  const handleFeedbackChange = (id, text) => {
    setFeedback(prev => ({ ...prev, [id]: text }));
  };

  const handleSuggestChanges = (id) => {
    if (!feedback[id]) {
      alert("Please provide feedback before suggesting changes.");
      return;
    }
    alert(`Feedback sent to student for Paper #${id}:\n\n"${feedback[id]}"`);
    setPendingReviews(prev => prev.filter(p => p.id !== id));
  };

  const handleApprove = (id) => {
    alert(`Paper #${id} Approved! It is now published/visible to admins.`);
    setPendingReviews(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Faculty Management Portal</h1>
        <p className="text-xs text-slate-500 mt-1">Review student submissions and manage research publications.</p>
      </div>

      {/* Custom Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('review')}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'review' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Student Papers for Review
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'upload' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Upload Direct Publication
        </button>
      </div>

      {activeTab === 'review' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Pending Student Submissions ({pendingReviews.length})
          </h2>

          {pendingReviews.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              No pending papers to review at this time.
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingReviews.map(paper => (
                <div key={paper.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{paper.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Submitted by <span className="font-semibold text-slate-700">{paper.student}</span> on {paper.date}
                      </p>
                    </div>
                    <button className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg">
                      <FileText className="w-4 h-4" /> View Document
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> Faculty Feedback
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Leave constructive feedback or suggest changes..."
                      value={feedback[paper.id] || ''}
                      onChange={(e) => handleFeedbackChange(paper.id, e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    ></textarea>
                    
                    <div className="flex items-center gap-2 justify-end mt-2">
                      <button
                        onClick={() => handleSuggestChanges(paper.id)}
                        className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg transition shadow-sm"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Suggest Changes
                      </button>
                      <button
                        onClick={() => handleApprove(paper.id)}
                        className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Paper
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" /> Direct Paper Upload
          </h2>
          <p className="text-sm text-slate-600 mb-6">Upload your own faculty publications directly to the repository.</p>
          
          {/* Simple dummy form for layout purposes */}
          <div className="space-y-4">
            <input type="text" placeholder="Paper Title" className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <textarea rows="3" placeholder="Abstract..." className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 cursor-pointer hover:bg-slate-100">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600">Select PDF file</p>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow-md">
              Publish Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
