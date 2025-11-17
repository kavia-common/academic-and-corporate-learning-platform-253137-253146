import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchAssignments as listAssignmentsByCourse } from '../supabase';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * AssignmentList shows assignments by course (if courseId in route) or student's assignments.
 */
export default function AssignmentList() {
  const { courseId } = useParams();
  const { status, role, user } = useAuth();

  const [assignments, setAssignments] = useState([]);
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
        let data = [];
        if (courseId) {
          data = await listAssignmentsByCourse(courseId);
        } else if (isAuthed && r === 'student') {
          // Fallback: load all assignments if no course filter (could be optimized with a join/view)
          const res = await listAssignmentsByCourse(undefined);
          data = res;
        } else {
          // Default to empty when no context
          data = [];
        }
        if (!mounted) return;
        setAssignments(data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load assignments.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseId, isAuthed, r, user]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h1 className="text-2xl font-semibold">
          {courseId ? 'Course Assignments' : 'My Assignments'}
        </h1>
        {(isAuthed && (r === 'instructor' || r === 'admin') && courseId) && (
          <Link to={`/courses/${courseId}/assignments/new`} className="btn">New assignment</Link>
        )}
      </div>

      {loading && <div className="card" style={{ padding: 16 }}>Loading assignments…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <div style={{ display: 'grid', gap: 12 }}>
          {assignments.length === 0 ? (
            <div className="card" style={{ padding: 16 }}>No assignments yet.</div>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="card" style={{ padding: 16, display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/assignments/${a.id}`} className="link" style={{ fontWeight: 600, fontSize: 18 }}>
                    {a.title}
                  </Link>
                  {(isAuthed && (r === 'instructor' || r === 'admin')) && (
                    <Link to={`/assignments/${a.id}/submissions`} className="btn">View submissions</Link>
                  )}
                </div>
                {a.due_date && (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                    Due: {new Date(a.due_date).toLocaleString()}
                  </div>
                )}
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  {a.description || 'No description provided.'}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
