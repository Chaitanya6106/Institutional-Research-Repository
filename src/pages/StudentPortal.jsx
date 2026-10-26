
import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  X,
  Loader2,
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('submissions');
  const [title, setTitle] = useState('');
  const [guide, setGuide] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const fileInputRef = useRef(null);

  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      title: 'AI based Smart Parking Management System',
      status: 'Approved',
      feedback: '',
      date: '2026-03-10',
    },
    {
      id: 2,
      title: 'Autonomous Drone Navigation using CNN',
      status: 'Changes Requested',
      feedback:
        'Please update the abstract to include more details about the CNN architecture used. Also fix citations on page 4.',
      date: '2026-03-20',
    },
    {
      id: 3,
      title: 'IoT Weather Forecasting Station',
      status: 'Pending Review',
      feedback: '',
      date: '2026-03-25',
    },
  ]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  const chooseFile = (file) => {
    setMessage('');

    if (!file) return;

    if (file.type !== 'application/pdf' &&
        !file.name.toLowerCase().endsWith('.pdf')) {
      showMessage('Please select a PDF document.', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showMessage('The PDF must be smaller than 25 MB.', 'error');
      return;
    }

    if (file.size === 0) {
      showMessage('The selected file is empty.', 'error');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!title.trim() || !guide.trim() || !abstractText.trim()) {
      showMessage('Please complete all required fields.', 'error');
      return;
    }

    if (!selectedFile) {
      showMessage('Please select a PDF before submitting.', 'error');
      return;
    }

    setUploading(true);

    let uploadedPath = null;

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.user) {
        showMessage('Your session has expired. Please log in again.', 'error');
        return;
      }

      // Use a unique, user-specific path inside the private Papers bucket.
      const safeName = selectedFile.name
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9._-]/g, '_');

      uploadedPath =
        `submissions/${session.user.id}/${Date.now()}_${safeName}`;

      const { error: storageError } = await supabase.storage
        .from('Papers')
        .upload(uploadedPath, selectedFile, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (storageError) {
        console.error('Storage upload failed:', storageError);
        throw new Error(
          `PDF upload failed: ${storageError.message}`
        );
      }

      // This table and these columns must exist in your database.
      const { error: databaseError } = await supabase
        .from('paper_submissions')
        .insert({
          student_id: session.user.id,
          title: title.trim(),
          faculty_guide: guide.trim(),
          abstract: abstractText.trim(),
          pdf_path: uploadedPath,
          status: 'Pending Review',
        });

      if (databaseError) {
        console.error('Submission record failed:', databaseError);

        // Avoid leaving an orphaned PDF if the record cannot be saved.
        const { error: cleanupError } = await supabase.storage
          .from('Papers')
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error('Could not remove orphaned PDF:', cleanupError);
        }

        const dbMessage = databaseError.message || 'Unknown database error';
        const dbCode = databaseError.code ? ` (code ${databaseError.code})` : '';
        const lowerMessage = dbMessage.toLowerCase();

        let nextStep = '';
        if (
          lowerMessage.includes('schema cache') ||
          lowerMessage.includes('could not find the table')
        ) {
          nextStep =
            " In Supabase SQL Editor, run: NOTIFY pgrst, 'reload schema'; then wait a few seconds and try again.";
        } else if (
          lowerMessage.includes('row-level security') ||
          lowerMessage.includes('violates row-level security')
        ) {
          nextStep =
            ' Check that the INSERT policy on public.paper_submissions allows authenticated users when student_id = auth.uid().';
        }

        throw new Error(
          `The PDF upload was attempted, but saving the submission failed${dbCode}: ${dbMessage}.${nextStep}`
        );
      }

      setSubmissions((previous) => [
        {
          id: uploadedPath,
          title: title.trim(),
          status: 'Pending Review',
          feedback: '',
          date: new Date().toISOString().slice(0, 10),
        },
        ...previous,
      ]);

      setTitle('');
      setGuide('');
      setAbstractText('');
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      showMessage('Paper uploaded and submitted successfully.');
      setActiveTab('submissions');
    } catch (error) {
      console.error('Paper submission failed:', error);
      showMessage(error.message || 'Unable to submit the paper.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'Changes Requested':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" /> Changes Requested
          </span>
        );
      case 'Pending Review':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Student Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit your research papers for faculty review and track publication status.
        </p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'submissions'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Submissions
        </button>

        <button
          type="button"
          onClick={() => {
            setMessage('');
            setActiveTab('upload');
          }}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'upload'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Submit New Paper
        </button>
      </div>

      {message && (
        <div
          role="alert"
          className={`rounded-lg border p-3 text-sm ${
            messageType === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {message}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="grid gap-4">
          {submissions.map((paper) => (
            <div
              key={paper.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900">{paper.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted on {paper.date}
                  </p>
                </div>
                {getStatusBadge(paper.status)}
              </div>

              {paper.status === 'Changes Requested' && paper.feedback && (
                <div className="mt-4 bg-rose-50 p-4 rounded-lg border border-rose-100">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Faculty Feedback
                  </h4>
                  <p className="text-sm text-rose-700 leading-relaxed">
                    {paper.feedback}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="mt-3 text-xs bg-white border border-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-100 transition shadow-sm"
                  >
                    Re-upload Corrected File
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'upload' && (
        <form
          onSubmit={handleUploadSubmit}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Submit Paper for Review
          </h2>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Paper Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter complete title"
              className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Assigned Faculty Guide
            </label>
            <input
              type="text"
              name="guide"
              required
              value={guide}
              onChange={(e) => setGuide(e.target.value)}
              placeholder="Enter faculty name..."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Abstract
            </label>
            <textarea
              rows="4"
              required
              value={abstractText}
              onChange={(e) => setAbstractText(e.target.value)}
              placeholder="Paste your abstract here..."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              PDF Document
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => chooseFile(e.target.files?.[0])}
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                chooseFile(e.dataTransfer.files?.[0]);
              }}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
            >
              {selectedFile ? (
                <>
                  <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 break-all">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-rose-600 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" /> Remove file
                  </button>
                </>
              ) : (
                <>
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">
                    Click to browse or drag PDF here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Maximum file size: 25MB
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-md mt-4 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              'Submit to Faculty'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
