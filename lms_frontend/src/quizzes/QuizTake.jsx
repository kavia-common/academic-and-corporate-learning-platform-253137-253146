import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getQuizById, getQuestions, recordAttempt } from '../supabase/supabaseQuizzes';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * QuizTake allows students to answer and submit, computes score, stores attempt, and shows result.
 */
export default function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, role, user } = useAuth();

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const [qz, qs] = await Promise.all([getQuizById(id), getQuestions(id)]);
        if (!mounted) return;
        setQuiz(qz);
        setQuestions(qs);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load quiz.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const totalPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  }, [questions]);

  const computeScore = () => {
    let score = 0;
    const normalizedAnswers = [];
    questions.forEach((q) => {
      const selectedIndex = Number.isFinite(answers[q.id]) ? answers[q.id] : -1;
      if (selectedIndex === q.correct_index) {
        score += Number(q.points) || 0;
      }
      normalizedAnswers.push({ question_id: q.id, selected_index: selectedIndex });
    });
    return { score, total_points: totalPoints, normalizedAnswers };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthed || r !== 'student') {
      setErr('Only authenticated students can take quizzes.');
      return;
    }
    try {
      setSubmitting(true);
      setErr('');
      const { score, total_points, normalizedAnswers } = computeScore();
      const attempt = await recordAttempt({
        quiz_id: id,
        user_id: user?.id,
        answers: normalizedAnswers,
        score,
        total_points,
      });
      setResult({ score, total_points, attempt_id: attempt?.id });
    } catch (e2) {
      setErr(e2?.message || 'Failed to submit attempt.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthed) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          You must be signed in to take a quiz. <Link to="/login" className="link">Sign in</Link>
        </div>
      </div>
    );
  }

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
            <Link to={`/quizzes/${quiz.id}`} className="link">← Back to quiz</Link>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>{quiz.description || 'Answer the questions below.'}</p>

          {r !== 'student' && (
            <div className="card" role="alert" style={{ padding: 12, background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.3)' }}>
              Note: Only students accrue attempts and scores. Other roles can preview but attempts are not recorded.
            </div>
          )}

          {result ? (
            <div className="card" style={{ padding: 16 }}>
              <h2 className="text-xl" style={{ marginTop: 0 }}>Your result</h2>
              <p style={{ margin: 0 }}>
                Score: <strong>{result.score}</strong> / {result.total_points}
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="btn" onClick={() => navigate(`/quizzes/${id}`, { replace: true })}>
                  Done
                </button>
                <button className="btn" onClick={() => { setResult(null); setAnswers({}); }}>
                  Retake (new attempt)
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 12 }}>
              {questions.length === 0 ? (
                <div className="card" style={{ padding: 12 }}>No questions available for this quiz.</div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id || idx} className="card" style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      {idx + 1}. {q.prompt} {Number(q.points) ? <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>({q.points} pt{Number(q.points) === 1 ? '' : 's'})</span> : null}
                    </div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {(q.options || []).map((opt, oIdx) => {
                        const label = typeof opt === 'string' ? opt : JSON.stringify(opt);
                        return (
                          <label key={oIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              checked={answers[q.id] === oIdx}
                              onChange={() => setAnswers((a) => ({ ...a, [q.id]: oIdx }))}
                            />
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button type="submit" className="btn" disabled={submitting || questions.length === 0} aria-busy={submitting}>
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  Total points: {totalPoints}
                </span>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
