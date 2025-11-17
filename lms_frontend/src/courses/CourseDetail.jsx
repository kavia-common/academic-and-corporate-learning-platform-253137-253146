import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { enrollInCourse, fetchCourseById as getCourseById, listCourseVideos, addCourseVideo } from '../supabase';
import { useAuth } from '../auth/AuthProvider';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import VideoRedirect from '../components/videos/VideoRedirect';

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
  const [videos, setVideos] = useState([]);
  const [err, setErr] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrolledMsg, setEnrolledMsg] = useState('');

  // Inline add-video state (shown when no videos)
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoFeedback, setVideoFeedback] = useState('');
  // When set, we render <VideoRedirect> to navigate user to the selected video URL
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');

  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const cRes = await getCourseById(id);
        if (!mounted) return;
        if (!cRes?.ok) {
          throw new Error(cRes?.error?.message || 'Failed to load course.');
        }
        setCourse(cRes.data);
        // fetch course videos (ignore errors silently but show none)
        try {
          const vRes = await listCourseVideos(id);
          if (mounted && vRes?.ok) {
            setVideos(Array.isArray(vRes.data) ? vRes.data : []);
          } else if (mounted) {
            setVideos([]);
          }
        } catch {
          if (mounted) setVideos([]);
        }
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
      {/* When a video has been selected or added, immediately redirect */}
      {selectedVideoUrl ? <VideoRedirect videoUrl={selectedVideoUrl} /> : null}
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

          {/* Course videos */}
          <div className="card" style={{ padding: 12 }}>
            <h2 className="text-xl" style={{ margin: 0 }}>Videos</h2>
            {Array.isArray(videos) && videos.length > 0 ? (
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {videos.map((v) => (
                  <div key={v.id} className="card" style={{ padding: 12 }}>
                    <div className="flex items-center justify-between">
                      <strong>{v.title || 'Video'}</strong>
                    </div>
                    <VideoPreview url={v.url} />
                    <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                      <a href={v.url} target="_blank" rel="noreferrer" className="link">Open original</a>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setSelectedVideoUrl(String(v.url || '').trim())}
                        aria-label="Open video"
                      >
                        Open here
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Paste a video URL to add the first video to this course.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setVideoFeedback('');
                    const url = String(newVideoUrl || '').trim();
                    if (!url) {
                      setVideoFeedback('Video URL is required.');
                      return;
                    }
                    try {
                      setAddingVideo(true);
                      const res = await addCourseVideo({
                        course_id: id,
                        title: String(newVideoTitle || '').trim() || null,
                        url,
                        created_by: user?.id || null,
                      });
                      if (!res?.ok) throw new Error(res?.error?.message || 'Failed to add video');

                      const vRes = await listCourseVideos(id);
                      if (!vRes?.ok) throw new Error(vRes?.error?.message || 'Failed to refresh videos');
                      setVideos(Array.isArray(vRes.data) ? vRes.data : []);
                      setNewVideoUrl('');
                      setNewVideoTitle('');
                      setVideoFeedback('Video added successfully.');
                      // Trigger redirect to the newly added URL
                      setSelectedVideoUrl(url);
                    } catch (eAdd) {
                      setVideoFeedback(eAdd?.message || 'Failed to add video.');
                    } finally {
                      setAddingVideo(false);
                    }
                  }}
                  className="space-y-3"
                  noValidate
                >
                  <div className="grid gap-2">
                    <Input
                      label="Title (optional)"
                      name="video_title"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      placeholder="Intro, Lesson 1, etc."
                      type="text"
                    />
                    <Input
                      label="Video URL"
                      name="video_url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                      type="url"
                      inputMode="url"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" loading={addingVideo} disabled={addingVideo}>
                      {addingVideo ? 'Adding…' : 'Add video'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setNewVideoUrl('');
                        setNewVideoTitle('');
                        setVideoFeedback('');
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                  {videoFeedback && (
                    <div
                      className="rounded-md border p-2 text-sm"
                      style={{
                        borderColor: videoFeedback.toLowerCase().includes('success') ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)',
                        background: videoFeedback.toLowerCase().includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                        color: videoFeedback.toLowerCase().includes('success') ? '#166534' : '#991b1b',
                      }}
                      role="status"
                    >
                      {videoFeedback}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * VideoPreview renders a Google Drive preview iframe when possible; otherwise renders a link.
 */
function VideoPreview({ url }) {
  const embed = toEmbedUrl(url);
  if (!embed) {
    return (
      <div style={{ marginTop: 8 }}>
        <a href={url} target="_blank" rel="noreferrer" className="link">
          Open video
        </a>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 8 }}>
      <div className="aspect-video w-full rounded-md overflow-hidden border border-gray-200">
        <iframe
          title="Video Preview"
          src={embed}
          className="w-full h-full"
          allow="autoplay"
        />
      </div>
    </div>
  );
}

function toEmbedUrl(url) {
  if (typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    const host = u.hostname || '';
    if (host.includes('drive.google.com')) {
      const newPath = u.pathname.replace(/\/view(?:$|[/?#])/, '/preview$1');
      return `${u.protocol}//${u.host}${newPath}${u.search}`;
    }
    return null;
  } catch {
    return null;
  }
}
