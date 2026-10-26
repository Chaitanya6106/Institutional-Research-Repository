import React, { useCallback, useEffect, useState } from 'react';
import {
  FileText,
  Check,
  MessageSquare,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function FacultyPortal() {
  const [papers, setPapers] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const loadPapers = useCallback(async () => {
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error('Please log in again.');
      }

      // Fetch the profile using the actual users table columns.
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('user_id, name, email, role')
        .ilike('email', user.email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error(
          `No profile was found in public.users for ${user.email}. Check the users table email and user_id.`
        );
      }

      const role = (profile.role || '').toLowerCase().trim();

      if (!['researcher', 'faculty', 'admin'].includes(role)) {
        throw new Error(
          'This account does not have faculty or admin access.'
        );
      }

      let query = supabase
        .from('paper_submissions')
        .select(
          'id, student_id, title, faculty_guide, abstract, pdf_path, status, feedback, created_at'
        )
        .ilike('status', 'Pending Review')
        .order('created_at', { ascending: false });

      // Admins can view all pending submissions.
      // Faculty/researchers see papers assigned to their profile name.
     

      const { data, error } = await query;
      console.log('Faculty papers query result:', data);
console.log('Faculty papers query error:', error);

      if (error) throw error;

      setPapers(data || []);

      setFeedback((previous) => {
        const next = { ...previous };

        (data || []).forEach((paper) => {
          if (next[paper.id] === undefined) {
            next[paper.id] = paper.feedback || '';
          }
        });

        return next;
      });
    } catch (err) {
      console.error('Loading submissions failed:', err);
      setPapers([]);
      setIsError(true);
      setMessage(`Could not load papers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  const viewPDF = async (paper) => {
    setMessage('');
    setIsError(false);

    try {
      if (!paper.pdf_path) {
        throw new Error('No PDF path is saved for this submission.');
      }

      // Convert a full Supabase Storage URL to a bucket-relative path
      // when necessary. Otherwise, use the stored relative path.
      let filePath = paper.pdf_path;

      const publicMarker = '/storage/v1/object/public/Papers/';
      const signMarker = '/storage/v1/object/sign/Papers/';

      if (filePath.includes(publicMarker)) {
        filePath = filePath.split(publicMarker)[1].split('?')[0];
      } else if (filePath.includes(signMarker)) {
        filePath = filePath.split(signMarker)[1].split('?')[0];
      }

      filePath = decodeURIComponent(filePath);

      const { data, error } = await supabase.storage
        .from('Papers')
        .createSignedUrl(filePath, 60);

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error('Supabase did not return a signed URL.');
      }

      // Open synchronously in a new tab to reduce popup-blocking issues.
      const pdfWindow = window.open('about:blank', '_blank');

      if (pdfWindow) {
        pdfWindow.opener = null;
        pdfWindow.location.href = data.signedUrl;
      } else {
        // If popups are blocked, show a clickable link in the page.
        setMessage(
          `Your browser blocked the PDF tab. Open this link: ${data.signedUrl}`
        );
      }
    } catch (err) {
      console.error('Opening PDF failed:', err);
      setIsError(true);
      setMessage(`Unable to open PDF: ${err.message}`);
    }
  };

  const reviewPaper = async (paper, status) => {
    const note = (feedback[paper.id] || '').trim();

    if (status === 'Changes Requested' && !note) {
      setIsError(true);
      setMessage('Enter faculty feedback before requesting changes.');
      return;
    }

    setBusyId(paper.id);
    setMessage('');
    setIsError(false);

    try {
      const { data, error } = await supabase
        .from('paper_submissions')
        .update({
          status,
          feedback: status === 'Changes Requested' ? note : '',
        })
        .eq('id', paper.id)
        .select('id')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          'No row was updated. Check the paper_submissions UPDATE RLS policy.'
        );
      }

      setMessage(
        status === 'Approved'
          ? 'Paper approved successfully.'
          : 'Feedback sent to the student.'
      );

      // Reload pending papers after the review action.
      await loadPapers();
    } catch (err) {
      console.error('Review action failed:', err);
      setIsError(true);
      setMessage(`Could not update paper: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Faculty Management Portal
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review student submissions and manage research papers.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-sm break-words ${
            isError
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {message.startsWith('Your browser blocked the PDF tab. Open this link: ') ? (
            <>
              Your browser blocked the PDF tab.{' '}
              <a
                href={message.replace(
                  'Your browser blocked the PDF tab. Open this link: ',
                  ''
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Open PDF
              </a>
            </>
          ) : (
            message
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">
          Pending Student Submissions ({papers.length})
        </h2>

        <button
          type="button"
          onClick={loadPapers}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={
              loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'
            }
          />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-slate-600">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
          Loading submissions...
        </div>
      ) : papers.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-slate-50 p-8 text-center text-slate-600">
          No pending submissions were returned by Supabase.
          This page does not filter by faculty guide. Confirm the paper status
          is "Pending Review" and that the Supabase SELECT RLS policy allows
          this signed-in faculty/researcher/admin to read all pending submissions.
        </div>
      ) : (
        <div className="grid gap-4">
          {papers.map((paper) => (
            <article
              key={paper.id}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {paper.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Submitted on{' '}
                    {new Date(paper.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Faculty guide: {paper.faculty_guide}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => viewPDF(paper)}
                  className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <FileText className="h-4 w-4" />
                  View Document
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1 text-xs font-bold text-slate-600">
                  Abstract
                </p>
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {paper.abstract}
                </p>
              </div>

              <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                <label
                  htmlFor={`feedback-${paper.id}`}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <MessageSquare className="h-4 w-4" />
                  Faculty Feedback
                </label>

                <textarea
                  id={`feedback-${paper.id}`}
                  rows={3}
                  value={feedback[paper.id] ?? ''}
                  onChange={(e) =>
                    setFeedback((previous) => ({
                      ...previous,
                      [paper.id]: e.target.value,
                    }))
                  }
                  placeholder="Enter feedback or requested changes..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={busyId === paper.id}
                    onClick={() =>
                      reviewPaper(paper, 'Changes Requested')
                    }
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {busyId === paper.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    Suggest Changes
                  </button>

                  <button
                    type="button"
                    disabled={busyId === paper.id}
                    onClick={() => reviewPaper(paper, 'Approved')}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {busyId === paper.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve Paper
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
