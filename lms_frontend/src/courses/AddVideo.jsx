import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { addCourseVideo, listCourseVideos, fetchCourseById } from '../supabase';
import { Card, CardBody, CardHeader, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

// PUBLIC_INTERFACE
/**
 * Admin-only page to add video links to a course and list them.
 * Route: /admin/courses/:courseId/add-video
 */
export default function AddVideo() {
  const { courseId } = useParams();
  const { status, role, user } = useAuth();

  const isAuthed = status === 'authenticated';
  const isAdmin = String(role || '').toLowerCase() === 'admin';

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ title: '', url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const [cRes, vRes] = await Promise.all([
          fetchCourseById(courseId),
          listCourseVideos(courseId),
        ]);
        if (!mounted) return;

        if (!cRes.ok) throw new Error(cRes.error?.message || 'Failed to load course');
        if (!vRes.ok) throw new Error(vRes.error?.message || 'Failed to load videos');

        setCourse(cRes.data);
        setVideos(Array.isArray(vRes.data) ? vRes.data : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load course videos.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const addVideo = async (e) => {
    e.preventDefault();
    const url = String(form.url || '').trim();
    if (!url) {
      setErr('Video URL is required.');
      return;
    }
    try {
      setSaving(true);
      setErr('');
      const res = await addCourseVideo({
        course_id: courseId,
        title: String(form.title || '').trim() || null,
        url,
        created_by: user?.id || null,
      });
      if (!res.ok) throw new Error(res.error?.message || 'Failed to add video');
      // refresh list
      const vRes = await listCourseVideos(courseId);
      if (!vRes.ok) throw new Error(vRes.error?.message || 'Failed to refresh list');
      setVideos(Array.isArray(vRes.data) ? vRes.data : []);
      setForm({ title: '', url: '' });
    } catch (e2) {
      setErr(e2?.message || 'Failed to add video.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthed || !isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>You do not have access to this page.</CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Add course videos</h1>
            {course && (
              <p className="text-sm text-gray-600 mt-1">
                Course: <span className="font-medium">{course.title}</span>
              </p>
            )}
          </div>
          <Button as={Link} to={`/courses/${courseId}`} variant="secondary">
            Back to course
          </Button>
        </CardHeader>
        <CardBody>
          {loading && (
            <div className="rounded-md border border-gray-200 bg-white p-3 text-sm">
              Loading…
            </div>
          )}
          {err && !loading && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {err}
            </div>
          )}

          {!loading && !err && (
            <>
              <form onSubmit={addVideo} className="space-y-3" noValidate>
                <Input
                  label="Title (optional)"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={onChange}
                  placeholder="Intro, Lesson 1, etc."
                />
                <Input
                  label="Video URL"
                  name="url"
                  type="url"
                  value={form.url}
                  onChange={onChange}
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  required
                  inputMode="url"
                />
                <div className="flex gap-2">
                  <Button type="submit" loading={saving} disabled={saving}>Add video</Button>
                  <Button type="button" variant="secondary" onClick={() => setForm({ title: '', url: '' })}>
                    Clear
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Existing videos</h2>
                {videos.length === 0 ? (
                  <div className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700">
                    No videos yet. Add your first above.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {videos.map((v) => (
                      <li key={v.id} className="rounded-md border border-gray-200 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{v.title || 'Untitled video'}</div>
                            <a href={v.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                              {v.url}
                            </a>
                          </div>
                        </div>
                        <VideoPreview url={v.url} className="mt-3" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </CardBody>
        <CardFooter />
      </Card>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * VideoPreview renders an iframe for Google Drive links using preview mode,
 * otherwise displays a simple external link notice.
 */
export function VideoPreview({ url, className }) {
  const embedUrl = useMemo(() => toEmbedUrl(url), [url]);
  if (!embedUrl) {
    return (
      <div className={className}>
        <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
          Open video
        </a>
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="aspect-video w-full rounded-md overflow-hidden border border-gray-200">
        <iframe
          title="Video Preview"
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay"
        />
      </div>
    </div>
  );
}

/**
 * Convert Google Drive "view" links to "preview" links for embedding.
 * Returns null if not recognized.
 */
function toEmbedUrl(url) {
  if (typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    const host = u.hostname || '';
    if (host.includes('drive.google.com')) {
      // Replace '/view' with '/preview' while retaining path/query
      const newPath = u.pathname.replace(/\/view(?:$|[/?#])/, '/preview$1');
      const rebuilt = `${u.protocol}//${u.host}${newPath}${u.search}`;
      return rebuilt;
    }
    return null;
  } catch {
    return null;
  }
}
