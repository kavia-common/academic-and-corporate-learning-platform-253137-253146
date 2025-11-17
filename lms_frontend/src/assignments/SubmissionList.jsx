import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAssignmentById, listSubmissions } from '../supabase/supabaseAssignments';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * SubmissionList lists submissions for an assignment, accessible to instructors/admin.
 */
export default function SubmissionList() {
  const { id } = useParams(); // assignment id
  const { status, role } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const [a, s] = await Promise.all([getAssignmentById(id), listSubmissions(id)]);
        if (!mounted) return;
        setAssignment(a);
        setSubs(s);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load submissions.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (!isAuthed || !(r === 'instructor' || r === 'admin')) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          You do not have access to this page.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h1 className="text-2xl font-semibold">Submissions</h1>
        {assignment?.course_id && (
          <Link to={`/courses/${assignment.course_id}/assignments`} className="link">
            ← Back to assignments
          </Link>
        )}
      </div>

      {loading && <div className="card" style={{ padding: 16 }}>Loading…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>{assignment?.title}</strong>
            {assignment?.due_date && (
              <span style={{ marginLeft: 8, color: 'var(--color-text-muted)' }}>
                (Due {new Date(assignment.due_date).toLocaleString()})
              </span>
            )}
          </div>
          {subs.length === 0 ? (
            <div>No submissions yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {subs.map((s) => (
                <div key={s.id} className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Student: {s.student_id}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                        Submitted at: {new Date(s.created_at).toLocaleString()}
                      </div>
                    </div>
                    {s.file_url && (
                      <a href={s.file_url} target="_blank" rel="noreferrer" className="link">
                        Open file
                      </a>
                    )}
                  </div>
                  {s.content && (
                    <p style={{ marginTop: 8 }}>{s.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
