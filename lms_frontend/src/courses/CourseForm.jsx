import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCourse, fetchCourseById as getCourseById, updateCourse } from '../supabase';
import { useAuth } from '../auth/AuthProvider';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelFocusRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    if (editing) {
      (async () => {
        try {
          setLoading(true);
          setErr('');
          const data = await getCourseById(id);
          if (!mounted) return;
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
      <div className="p-6">
        <Card>
          <CardBody>You do not have access to this page.</CardBody>
        </Card>
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
    <div className="p-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{editing ? 'Edit course' : 'Create course'}</h1>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>Cancel</Button>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-3">
              {err && (
                <div
                  className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  role="alert"
                >
                  {err}
                </div>
              )}

              <Input
                label="Title"
                name="title"
                type="text"
                value={form.title}
                onChange={onChange}
                placeholder="e.g., Introduction to React"
                required
              />

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={onChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the course overview and objectives"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : (editing ? 'Save changes' : 'Create')}
                </Button>
                <Link to="/courses" className="text-blue-600 hover:underline text-sm self-center">
                  Back to courses
                </Link>
              </div>
            </form>
          )}
        </CardBody>
        <CardFooter />
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Discard changes?"
        initialFocusRef={cancelFocusRef}
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to discard your changes? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            ref={cancelFocusRef}
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
          >
            Keep editing
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setForm({ title: '', description: '' });
              setConfirmOpen(false);
            }}
          >
            Discard
          </Button>
        </div>
      </Modal>
    </div>
  );
}
