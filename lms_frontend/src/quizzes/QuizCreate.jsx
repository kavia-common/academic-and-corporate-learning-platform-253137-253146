import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createQuiz, createQuestions } from '../supabase';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * QuizCreate lets instructors/admin create a quiz with questions.
 * Route: /quizzes/new or /courses/:courseId/quizzes/new
 */
export default function QuizCreate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { status, role, user } = useAuth();

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  const [meta, setMeta] = useState({ title: '', description: '' });
  const [questions, setQuestions] = useState([
    { prompt: '', options: ['', ''], correct_index: 0, points: 1 },
  ]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (!isAuthed || r !== 'admin') {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          You do not have access to this page.
        </div>
      </div>
    );
  }

  const updateQuestion = (idx, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { prompt: '', options: ['', ''], correct_index: 0, points: 1 }]);
  };

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const addOption = (qIdx) => {
    setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ''] } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = q.options.slice();
        opts[optIdx] = value;
        return { ...q, options: opts };
      })
    );
  };

  const removeOption = (qIdx, optIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = q.options.slice();
        opts.splice(optIdx, 1);
        const newCorrect = Math.min(q.correct_index, Math.max(0, opts.length - 1));
        return { ...q, options: opts, correct_index: newCorrect };
      })
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const title = String(meta.title || '').trim();
    if (!title) {
      setErr('Title is required.');
      return;
    }
    const validQuestions = questions
      .map((q) => ({
        prompt: String(q.prompt || '').trim(),
        options: (q.options || []).map((o) => String(o || '').trim()).filter(Boolean),
        correct_index: Number(q.correct_index) || 0,
        points: Number(q.points) || 1,
      }))
      .filter((q) => q.prompt && Array.isArray(q.options) && q.options.length >= 2);

    if (validQuestions.length === 0) {
      setErr('Please add at least one valid question with 2 or more options.');
      return;
    }

    try {
      setSaving(true);
      setErr('');
      const created = await createQuiz({
        course_id: courseId || null,
        title,
        description: meta.description,
        created_by: user?.id,
      });
      await createQuestions(created.id, validQuestions);
      navigate(`/quizzes/${created.id}`, { replace: true });
    } catch (e2) {
      setErr(e2?.message || 'Failed to create quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-2xl font-semibold" style={{ margin: 0 }}>
            New quiz
          </h1>
          <Link to={courseId ? `/courses/${courseId}/quizzes` : '/quizzes'} className="link">Cancel</Link>
        </div>

        <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 16, marginTop: 12 }}>
          {err && (
            <div
              className="card"
              role="alert"
              style={{ padding: 12, background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--color-error)' }}
            >
              {err}
            </div>
          )}

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Title</span>
            <input
              type="text"
              value={meta.title}
              onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
              className="topbar-search"
              style={{ borderRadius: 8 }}
              placeholder="e.g., React Fundamentals Quiz"
              required
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Description</span>
            <textarea
              rows={3}
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
              className="topbar-search"
              style={{ borderRadius: 8 }}
              placeholder="Short overview of what this quiz covers"
            />
          </label>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-xl" style={{ margin: 0 }}>Questions</h2>
              <button type="button" className="btn" onClick={addQuestion}>Add question</button>
            </div>

            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Question {qIdx + 1}</strong>
                    <button type="button" className="btn" onClick={() => removeQuestion(qIdx)} aria-label="Remove question">
                      Remove
                    </button>
                  </div>

                  <label style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                    <span>Prompt</span>
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                      className="topbar-search"
                      style={{ borderRadius: 8 }}
                      placeholder="Enter the question"
                    />
                  </label>

                  <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Options</span>
                      <button type="button" className="btn" onClick={() => addOption(qIdx)}>Add option</button>
                    </div>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'grid', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                            className="topbar-search"
                            style={{ borderRadius: 8, flex: 1 }}
                            placeholder={`Option ${oIdx + 1}`}
                          />
                          <button type="button" className="btn" onClick={() => removeOption(qIdx, oIdx)} aria-label="Remove option">
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span>Correct option index (0-based)</span>
                      <input
                        type="number"
                        min={0}
                        max={Math.max(0, q.options.length - 1)}
                        value={q.correct_index}
                        onChange={(e) => updateQuestion(qIdx, { correct_index: Number(e.target.value) })}
                        className="topbar-search"
                        style={{ borderRadius: 8, maxWidth: 160 }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: 6 }}>
                      <span>Points</span>
                      <input
                        type="number"
                        min={0}
                        value={q.points}
                        onChange={(e) => updateQuestion(qIdx, { points: Number(e.target.value) })}
                        className="topbar-search"
                        style={{ borderRadius: 8, maxWidth: 160 }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn" disabled={saving} aria-busy={saving}>
              {saving ? 'Creating…' : 'Create quiz'}
            </button>
            <Link to={courseId ? `/courses/${courseId}/quizzes` : '/quizzes'} className="link">Back to quizzes</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
