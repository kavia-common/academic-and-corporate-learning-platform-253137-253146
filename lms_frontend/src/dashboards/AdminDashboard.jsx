import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminCounts, listRecentItems } from '../supabase/supabaseUsers';

/**
 * PUBLIC_INTERFACE
 * AdminDashboard renders platform-wide metrics and recent items for administrators.
 */
export default function AdminDashboard() {
  const [counts, setCounts] = useState({ courses: 0, enrollments: 0, assignments: 0, quizzes: 0, attempts: 0 });
  const [recents, setRecents] = useState({ courses: [], quizzes: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Optional charts using recharts if present at runtime
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
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const [c, r] = await Promise.all([getAdminCounts(), listRecentItems({ role: 'admin', limit: 5 })]);
        if (!mounted) return;
        setCounts(c);
        setRecents(r);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load admin dashboard.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const chartData = [
    { name: 'Courses', value: counts.courses },
    { name: 'Enrollments', value: counts.enrollments },
    { name: 'Assignments', value: counts.assignments },
    { name: 'Quizzes', value: counts.quizzes },
    { name: 'Attempts', value: counts.attempts },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {loading && <div className="card" style={{ padding: 16, marginTop: 12 }}>Loading…</div>}
      {err && !loading && (
        <div className="card" role="alert" style={{ padding: 16, marginTop: 12, background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--color-error)' }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 12 }}>
            <MetricCard label="Courses" value={counts.courses} />
            <MetricCard label="Enrollments" value={counts.enrollments} />
            <MetricCard label="Assignments" value={counts.assignments} />
            <MetricCard label="Quizzes" value={counts.quizzes} />
            <MetricCard label="Quiz Attempts" value={counts.attempts} />
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
            <RecentList title="Recent Courses" items={recents.courses} linkBase="/courses" />
            <RecentList title="Recent Quizzes" items={recents.quizzes} linkBase="/quizzes" />
            <RecentList title="Recent Assignments" items={recents.assignments} linkBase="/assignments" />
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

function RecentList({ title, items, linkBase }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 className="text-lg" style={{ marginTop: 0 }}>{title}</h3>
      {(!items || items.length === 0) ? (
        <div style={{ color: 'var(--color-text-muted)' }}>No items.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {items.map((it) => (
            <li key={it.id} className="card" style={{ padding: 10 }}>
              <Link to={`${linkBase}/${it.id}`} className="link" style={{ fontWeight: 600 }}>
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
