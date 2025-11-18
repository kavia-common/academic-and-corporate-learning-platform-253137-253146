import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useProgress } from '../hooks/useProgress';

/**
 * PUBLIC_INTERFACE
 * MyProgress: Student's own progress across courses.
 */
export default function MyProgress() {
  const { user } = useAuth();
  const { data, loading, error } = useProgress({ userId: user?.id || null });

  const ui = {
    page: { maxWidth: 900, margin: '0 auto' },
    title: { font: '800 22px/28px "Helvetica Neue", Arial, sans-serif', color: '#111827', margin: '0 0 12px' },
    card: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, boxShadow: 'var(--ocn-shadow-1, 0 4px 12px rgba(12,32,80,0.08))' },
    grid: { display: 'grid', gap: 10 },
    hint: { color: '#4B5563', fontSize: 13 },
    row: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }
  };

  return (
    <section style={ui.page}>
      <h1 style={ui.title}>My Progress</h1>
      {loading && <div style={ui.hint}>Loading…</div>}
      {error && <div style={{ color: '#EF4444' }}>{error?.message || 'Failed to load progress.'}</div>}
      <div style={ui.grid}>
        {data.map((p) => (
          <div key={p.id} style={ui.card}>
            <div style={ui.row}>
              <div>
                <div style={{ fontWeight: 700 }}>{p.courses?.title || p.course_id}</div>
                <div style={{ color: '#6B7280', fontSize: 12 }}>
                  {Math.round(p.percent_complete ?? 0)}% • Last activity: {p.last_activity_at ? new Date(p.last_activity_at).toLocaleString() : '—'}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && <div style={ui.hint}>No progress records.</div>}
      </div>
    </section>
  );
}
