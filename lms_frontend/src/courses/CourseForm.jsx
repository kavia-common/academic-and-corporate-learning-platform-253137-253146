import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCourse, getCourseById, updateCourse } from '../supabase/supabaseCourses';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * CourseForm handles create and edit for instructor/admin.
 * Routes:
 * - /courses/new -> create
 * - /courses/:id/edit -> edit
 */
export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const { status, role, user } = useAuth();
  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(editing);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (editing) {
      (async () => {
        try {
          setLoading(true);
          setErr('');
          const data = await getCourseById(id);
          if (!mounted) return;
          // Only allow editing if current user is owner (instructor) or admin
          if (!(r === 'admin' || (r === 'instructor' && data.instructor_id === user?.id))) {
            navigate('/courses', { replace: true, state: { notice: 'You do not have permission to edit this course.' } });
            return;
          }
          setForm({ title: data.title || '', description: data.description || '' });
        } catch (e) {
          if (!mounted) return;
          setErr(e?.message || 'Failed to load course.');
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    }
    return () => { mounted = false; };
  }, [editing, id, navigate, r, user]);

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
      if (editing) {
        await updateCourse(id, { title, description: form.description });
        navigate(`/courses/${id}`, { replace: true });
      } else {
        const created = await createCourse({ title, description: form.description, instructor_id: user?.id });
        navigate(`/courses/${created.id}`, { replace: true });
      }
    } catch (e2) {
      setErr(e2?.message || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-2xl font-semibold" style={{ margin: 0 }}>
            {editing ? 'Edit course' : 'Create course'}
          </h1>
          <Link to="/courses" className="link">Cancel</Link>
        </div>

        {loading ? (
          <div style={{ marginTop: 12 }}>Loading…</div>
        ) : (
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
                placeholder="e.g., Introduction to React"
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
                placeholder="Describe the course overview and objectives"
              />
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn" disabled={saving} aria-busy={saving}>
                {saving ? 'Saving…' : (editing ? 'Save changes' : 'Create')}
              </button>
              <Link to="/courses" className="link">Back to courses</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
