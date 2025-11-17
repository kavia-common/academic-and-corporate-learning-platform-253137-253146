import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createCourse as createCourseService } from '../supabase';
import { useAuth } from '../auth/AuthProvider';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

/**
 * PUBLIC_INTERFACE
 * CreateCourse lets instructors/admin create a new course.
 * Route: /courses/create (or /courses/new depending on route config).
 *
 * Fields:
 * - title (required)
 * - description (optional)
 * - video_url (optional)
 *
 * Behavior:
 * - Uses existing Supabase service layer (createCourse).
 * - Validates title, shows user-friendly messages.
 * - On success, navigates to the course detail page.
 */
export default function CreateCourse() {
  const navigate = useNavigate();
  const { status, role, user } = useAuth();

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  const [form, setForm] = useState({
    title: '',
    description: '',
    video_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthed || !(r === 'admin')) {
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
      setSuccessMsg('');

      // Ensure we include video_url to match current schema
      const payload = {
        title,
        description: form.description || '',
        video_url: String(form.video_url || '').trim() || null,
        created_by: user?.id || null,
      };

      const created = await createCourseService(payload);
      setSuccessMsg('Course created successfully!');
      // Brief delay to let users perceive success before navigation
      setTimeout(() => {
        navigate(`/courses/${created.id}`, { replace: true });
      }, 300);
    } catch (e2) {
      setErr(e2?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create course</h1>
          <Button as={Link} to="/courses" variant="secondary" aria-label="Cancel create course">
            Cancel
          </Button>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} noValidate className="space-y-3">
            {err && (
              <div
                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {err}
              </div>
            )}
            {successMsg && (
              <div
                className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                role="status"
              >
                {successMsg}
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

            <Input
              label="Intro/Promo video URL (optional)"
              name="video_url"
              type="url"
              value={form.video_url}
              onChange={onChange}
              placeholder="https://example.com/video.mp4 or https://youtu.be/..."
              inputMode="url"
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating…' : 'Create course'}
              </Button>
              <Link to="/courses" className="text-blue-600 hover:underline text-sm self-center">
                Back to courses
              </Link>
            </div>
          </form>
        </CardBody>
        <CardFooter />
      </Card>
    </div>
  );
}
