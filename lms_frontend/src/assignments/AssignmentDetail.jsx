import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAssignmentById, submitAssignment } from '../supabase/supabaseAssignments';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * AssignmentDetail shows a single assignment. Students can submit via simple form.
 * Includes a placeholder for future file upload integration (e.g., Supabase Storage).
 */
export default function AssignmentDetail() {
  const { id } = useParams();
  const { status, role, user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await getAssignmentById(id);
        if (!mounted) return;
        setAssignment(data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load assignment.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthed || r !== 'student') {
      setSubmitMsg('');
      setErr('Only authenticated students can submit.');
      return;
    }
    if (!content.trim() && !fileUrl.trim()) {
      setErr('Please enter content or include a file URL.');
      return;
    }

    try {
      setSubmitting(true);
      setErr('');
      setSubmitMsg('');
      await submitAssignment({
        assignment_id: id,
        student_id: user?.id,
        content: content.trim(),
        file_url: fileUrl.trim() || null,
      });
      setSubmitMsg('Submission received successfully.');
      setContent('');
      setFileUrl('');
    } catch (e2) {
      setErr(e2?.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {loading && <div className="card" style={{ padding: 16 }}>Loading assignment…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}
      {!loading && !err && assignment && (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h1 className="text-2xl font-semibold" style={{ margin: 0 }}>{assignment.title}</h1>
            <Link to={assignment.course_id ? `/courses/${assignment.course_id}/assignments` : '/'} className="link">
              ← Back to assignments
            </Link>
          </div>
          {assignment.due_date && (
            <div style={{ color: 'var(--color-text-muted)' }}>
              Due: {new Date(assignment.due_date).toLocaleString()}
            </div>
          )}
          <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>{assignment.description || 'No description.'}</p>

          {(isAuthed && r === 'student') && (
            <div className="card" style={{ padding: 16 }}>
              <h2 className="text-xl" style={{ marginTop: 0 }}>Submit your work</h2>

              {submitMsg && (
                <div className="card" style={{ padding: 12, background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.3)', marginBottom: 12 }}>
                  {submitMsg}
                </div>
              )}
              {err && (
                <div className="card" role="alert" style={{ padding: 12, background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--color-error)', marginBottom: 12 }}>
                  {err}
                </div>
              )}

              <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Content/Notes</span>
                  <textarea
                    rows={5}
                    value={content}
                    onChange={(e) => { setContent(e.target.value); setErr(''); setSubmitMsg(''); }}
                    className="topbar-search"
                    style={{ borderRadius: 8, resize: 'vertical' }}
                    placeholder="Paste your solution, notes, or a link to your work"
                  />
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span>File URL (optional)</span>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => { setFileUrl(e.target.value); setErr(''); setSubmitMsg(''); }}
                    className="topbar-search"
                    style={{ borderRadius: 8 }}
                    placeholder="https://your-file-hosting.com/your-file"
                  />
                  <small style={{ color: 'var(--color-text-muted)' }}>
                    File upload placeholder: integrate Supabase Storage to upload and set file URL here in future.
                  </small>
                </label>

                <button type="submit" className="btn" disabled={submitting} aria-busy={submitting}>
                  {submitting ? 'Submitting…' : 'Submit assignment'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
