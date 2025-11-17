import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuizById, getQuestions, listAttempts } from '../supabase/supabaseQuizzes';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * QuizDetail shows metadata, questions (without revealing correct answers), and attempts summary.
 */
export default function QuizDetail() {
  const { id } = useParams();
  const { status, role, user } = useAuth();

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const [qz, qs, atts] = await Promise.all([
          getQuizById(id),
          getQuestions(id),
          listAttempts(id, { user_id: r === 'student' ? user?.id : undefined }),
        ]);
        if (!mounted) return;
        setQuiz(qz);
        setQuestions(qs);
        setAttempts(atts);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load quiz.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, r, user]);

  return (
    <div style={{ padding: 24 }}>
      {loading && <div className="card" style={{ padding: 16 }}>Loading quiz…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}
      {!loading && !err && quiz && (
        <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h1 className="text-2xl font-semibold" style={{ margin: 0 }}>{quiz.title}</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/quizzes" className="link">← Back to quizzes</Link>
              <Link to={`/quizzes/${quiz.id}/take`} className="btn">Take quiz</Link>
            </div>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>{quiz.description || 'No description.'}</p>

          <div className="card" style={{ padding: 12 }}>
            <h2 className="text-xl" style={{ marginTop: 0 }}>Questions</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {questions.length === 0 ? (
                <div>No questions added yet.</div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id || idx} className="card" style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{idx + 1}. {q.prompt}</div>
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18 }}>
                      {(q.options || []).map((opt, oIdx) => (
                        <li key={oIdx} style={{ color: 'var(--color-text-muted)' }}>
                          {typeof opt === 'string' ? opt : JSON.stringify(opt)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 12 }}>
            <h2 className="text-xl" style={{ marginTop: 0 }}>
              {r === 'student' ? 'My attempts' : 'Attempts'}
            </h2>
            {attempts.length === 0 ? (
              <div>No attempts yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {attempts.map((a) => (
                  <div key={a.id} className="card" style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        Score: {a.score} / {a.total_points}
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                        {new Date(a.created_at).toLocaleString()}
                        {r !== 'student' && a.user_id ? ` • User: ${a.user_id}` : ''}
                      </div>
                    </div>
                    <div>
                      {/* Future: link to attempt detail if needed */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
