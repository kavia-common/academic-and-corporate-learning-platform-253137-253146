import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { enrollInCourse, fetchCourseById as getCourseById } from '../supabase';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * CourseDetail shows a single course. Students can enroll; instructors/admin can navigate to edit.
 */
export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, role, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrolledMsg, setEnrolledMsg] = useState('');

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await getCourseById(id);
        if (!mounted) return;
        setCourse(data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load course.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const onEnroll = async () => {
    if (!isAuthed) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` }, notice: 'Please sign in to enroll.' } });
      return;
    }
    if (r !== 'student') {
      setEnrolledMsg('Only students can enroll in courses.');
      return;
    }
    try {
      setEnrolling(true);
      setErr('');
      setEnrolledMsg('');
      await enrollInCourse({ course_id: id, user_id: user?.id });
      setEnrolledMsg('You are enrolled! You may now access course content.');
    } catch (e) {
      setErr(e?.message || 'Failed to enroll.');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {loading && <div className="card" style={{ padding: 16 }}>Loading course…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}
      {!loading && !err && course && (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h1 className="text-2xl font-semibold" style={{ margin: 0 }}>{course.title}</h1>
            {isAuthed && (r === 'instructor' || r === 'admin') && user?.id === course.instructor_id && (
              <Link to={`/courses/${course.id}/edit`} className="btn">Edit</Link>
            )}
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>{course.description || 'No description.'}</p>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/courses" className="link">← Back to courses</Link>
            {r === 'student' && (
              <button type="button" className="btn" onClick={onEnroll} disabled={enrolling} aria-busy={enrolling}>
                {enrolling ? 'Enrolling…' : 'Enroll'}
              </button>
            )}
          </div>

          {enrolledMsg && (
            <div className="card" style={{ padding: 12, background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.3)' }}>
              {enrolledMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
