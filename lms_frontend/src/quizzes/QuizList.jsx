import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listQuizzes } from '../supabase/supabaseQuizzes';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * QuizList shows quizzes globally or by course if courseId is in route.
 */
export default function QuizList() {
  const { courseId } = useParams();
  const { status, role } = useAuth();
  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await listQuizzes({ courseId });
        if (!mounted) return;
        setQuizzes(data);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load quizzes.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h1 className="text-2xl font-semibold">
          {courseId ? 'Course Quizzes' : 'Quizzes'}
        </h1>
        {isAuthed && (r === 'instructor' || r === 'admin') && (
          <Link to={courseId ? `/courses/${courseId}/quizzes/new` : '/quizzes/new'} className="btn">
            New quiz
          </Link>
        )}
      </div>

      {loading && <div className="card" style={{ padding: 16 }}>Loading quizzes…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <div style={{ display: 'grid', gap: 12 }}>
          {quizzes.length === 0 ? (
            <div className="card" style={{ padding: 16 }}>No quizzes available.</div>
          ) : (
            quizzes.map((q) => (
              <div key={q.id} className="card" style={{ padding: 16, display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/quizzes/${q.id}`} className="link" style={{ fontWeight: 600, fontSize: 18 }}>
                    {q.title}
                  </Link>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/quizzes/${q.id}`} className="btn" aria-label={`View ${q.title}`}>View</Link>
                    <Link to={`/quizzes/${q.id}/take`} className="btn" aria-label={`Take ${q.title}`}>Take</Link>
                  </div>
                </div>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  {q.description || 'No description provided.'}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
