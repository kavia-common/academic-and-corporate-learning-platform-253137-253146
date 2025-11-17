import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { getStudentCounts, listRecentItems } from '../supabase/supabaseUsers';

/**
 * PUBLIC_INTERFACE
 * StudentDashboard renders the learner's metrics, recent enrollments, assignments, and quiz attempts.
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  const uid = user?.id;

  const [counts, setCounts] = useState({ courses: 0, enrollments: 0, assignments: 0, quizzes: 0, attempts: 0 });
  const [recents, setRecents] = useState({ enrollments: [], assignments: [], attempts: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const Recharts = useMemo(() => {
    try {
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = require('recharts');
      return { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer };
    } catch (_e) {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!uid) return () => {};
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const [c, r] = await Promise.all([
          getStudentCounts(uid),
          listRecentItems({ role: 'student', userId: uid, limit: 5 }),
        ]);
        if (!mounted) return;
        setCounts(c);
        setRecents(r);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load student dashboard.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [uid]);

  const chartData = [
    { name: 'Courses', value: counts.courses },
    { name: 'Assignments', value: counts.assignments },
    { name: 'Quizzes', value: counts.quizzes },
    { name: 'Attempts', value: counts.attempts },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Student Dashboard</h1>

      {loading && <div className="card" style={{ padding: 16, marginTop: 12 }}>Loading…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, marginTop: 12, background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 12 }}>
            <MetricCard label="My Courses" value={counts.courses} />
            <MetricCard label="Assignments" value={counts.assignments} />
            <MetricCard label="Quizzes" value={counts.quizzes} />
            <MetricCard label="My Attempts" value={counts.attempts} />
          </div>

          {Recharts && (
            <div className="card" style={{ padding: 16, marginTop: 12 }}>
              <h2 className="text-xl" style={{ marginTop: 0 }}>Overview</h2>
              <div style={{ width: '100%', height: 240 }}>
                <Recharts.ResponsiveContainer>
                  <Recharts.BarChart data={chartData}>
                    <Recharts.XAxis dataKey="name" />
                    <Recharts.YAxis allowDecimals={false} />
                    <Recharts.Tooltip />
                    <Recharts.Bar dataKey="value" fill="#2563EB" />
                  </Recharts.BarChart>
                </Recharts.ResponsiveContainer>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 12 }}>
            <RecentEnrollments items={recents.enrollments} />
            <RecentAssignments items={recents.assignments} />
            <RecentAttempts items={recents.attempts} />
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function RecentEnrollments({ items }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 className="text-lg" style={{ marginTop: 0 }}>Recent Enrollments</h3>
      {(!items || items.length === 0) ? (
        <div style={{ color: 'var(--color-text-muted)' }}>No enrollments yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {items.map((it) => (
            <li key={it.id} className="card" style={{ padding: 10 }}>
              <Link to={`/courses/${it.course_id}`} className="link" style={{ fontWeight: 600 }}>
                Course: {it.course_id}
              </Link>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {it.created_at ? new Date(it.created_at).toLocaleString() : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecentAssignments({ items }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 className="text-lg" style={{ marginTop: 0 }}>Recent Assignments</h3>
      {(!items || items.length === 0) ? (
        <div style={{ color: 'var(--color-text-muted)' }}>No assignments found.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {items.map((it) => (
            <li key={it.id} className="card" style={{ padding: 10 }}>
              <Link to={`/assignments/${it.id}`} className="link" style={{ fontWeight: 600 }}>
                {it.title || it.id}
              </Link>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {it.created_at ? new Date(it.created_at).toLocaleString() : ''}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecentAttempts({ items }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 className="text-lg" style={{ marginTop: 0 }}>Recent Quiz Attempts</h3>
      {(!items || items.length === 0) ? (
        <div style={{ color: 'var(--color-text-muted)' }}>No attempts yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {items.map((it) => (
            <li key={it.id} className="card" style={{ padding: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>Attempt: {it.id}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                {it.score}/{it.total_points} • {it.created_at ? new Date(it.created_at).toLocaleString() : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
