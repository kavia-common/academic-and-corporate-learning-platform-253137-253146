import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createAssignment } from '../supabase';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * AssignmentCreate lets instructors/admin create an assignment for a course.
 * Route: /courses/:courseId/assignments/new
 */
export default function AssignmentCreate() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { status, role, user } = useAuth();

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  const [form, setForm] = useState({
    title: '',
    description: '',
    due_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (!isAuthed || !(r === 'instructor' || r === 'admin')) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          You do not have access to this page.
        </div>
      </div>
    );
  }

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErr('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const title = String(form.title || '').trim();
    if (!title) {
      setErr('Title is required.');
      return;
    }
    try {
      setSaving(true);
      setErr('');
      const payload = {
        course_id: courseId,
        title,
        description: form.description,
        due_date: form.due_date || null,
        created_by: user?.id,
      };
      const created = await createAssignment(payload);
      navigate(`/assignments/${created.id}`, { replace: true });
    } catch (e2) {
      setErr(e2?.message || 'Failed to create assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-2xl font-semibold" style={{ margin: 0 }}>
            New assignment
          </h1>
          <Link to={`/courses/${courseId}/assignments`} className="link">Cancel</Link>
        </div>

        <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 12, marginTop: 12 }}>
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
              name="title"
              value={form.title}
              onChange={onChange}
              className="topbar-search"
              style={{ borderRadius: 8 }}
              placeholder="e.g., Project 1: Build a React App"
              required
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Description</span>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={onChange}
              className="topbar-search"
              style={{ borderRadius: 8, resize: 'vertical' }}
              placeholder="Instructions, requirements, grading rubric, etc."
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Due date (optional)</span>
            <input
              type="datetime-local"
              name="due_date"
              value={form.due_date}
              onChange={onChange}
              className="topbar-search"
              style={{ borderRadius: 8 }}
            />
          </label>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn" disabled={saving} aria-busy={saving}>
              {saving ? 'Creating…' : 'Create assignment'}
            </button>
            <Link to={`/courses/${courseId}/assignments`} className="link">Back to assignments</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
