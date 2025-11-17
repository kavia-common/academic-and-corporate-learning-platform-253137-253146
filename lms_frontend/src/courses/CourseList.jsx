import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCourses as listCourses } from '../supabase';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * CourseList renders available courses (all for students; instructor's own for instructors if filtered).
 */
export default function CourseList() {
  const { status, role, user } = useAuth();
  const [courses, setCourses] = useState([]);
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
        // Instructors may want to view their own first; for now, show all.
        const data = await listCourses();
        if (!mounted) return;
        setCourses(data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Unable to load courses.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h1 className="text-2xl font-semibold">Courses</h1>
        {isAuthed && (r === 'instructor' || r === 'admin') && (
          <Link to="/courses/new" className="btn" aria-label="Create course">Create course</Link>
        )}
      </div>

      {loading && <div className="card" style={{ padding: 16 }}>Loading courses…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <div style={{ display: 'grid', gap: 12 }}>
          {courses.length === 0 ? (
            <div className="card" style={{ padding: 16 }}>No courses available.</div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="card" style={{ padding: 16, display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/courses/${c.id}`} className="link" style={{ fontWeight: 600, fontSize: 18 }}>
                    {c.title}
                  </Link>
                  {isAuthed && (r === 'instructor' || r === 'admin') && user?.id === c.instructor_id && (
                    <Link to={`/courses/${c.id}/edit`} className="btn" aria-label={`Edit ${c.title}`}>
                      Edit
                    </Link>
                  )}
                </div>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  {c.description || 'No description provided.'}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
