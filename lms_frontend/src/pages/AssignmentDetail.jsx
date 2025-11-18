import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSubmissions, useSubmissionMutations } from '../hooks/useSubmissions';
import useSupabaseProfile from '../hooks/useSupabaseProfile';

/**
 * PUBLIC_INTERFACE
 * AssignmentDetail page for one assignment:
 * - Students: submit/update their work
 * - Instructors/Admin: view all submissions and grade
 */
export default function AssignmentDetail() {
  const { id: assignmentId } = useParams();
  const [rows, setRows] = useState([]);
  const { data, loading, error, refresh } = useSubmissions(assignmentId);
  const { submitWork, gradeSubmission, saving, error: saveError } = useSubmissionMutations(assignmentId, { onLocalUpdate: setRows });
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();

  useMemo(() => setRows(data || []), [data]);

  const ui = {
    page: { maxWidth: 900, margin: '0 auto' },
    headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { font: '800 22px/28px "Helvetica Neue", Arial, sans-serif', color: '#111827', margin: 0 },
    ghost: { background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' },
    card: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14, boxShadow: 'var(--ocn-shadow-1, 0 4px 12px rgba(12,32,80,0.08))' },
    grid: { display: 'grid', gap: 10 },
    hint: { color: '#4B5563', fontSize: 13 },
    error: { color: '#EF4444', fontSize: 13, marginBottom: 8 },
    label: { display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 },
    btn: { background: 'var(--ocn-primary, #2563EB)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' },
    row: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }
  };

  return (
    <section style={ui.page}>
      <div style={ui.headerRow}>
        <h1 style={ui.title}>Assignment</h1>
        <Link to="/courses" style={{ textDecoration: 'none' }}>
          <button style={ui.ghost}>Back</button>
        </Link>
      </div>

      {isStudent && (
        <div style={ui.card}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Submit your work</div>
          <StudentSubmissionForm onSubmit={submitWork} saving={saving} errorMsg={saveError?.message} />
        </div>
      )}

      <div style={{ marginTop: 12 }} />
      <div style={ui.grid}>
        <div style={{ fontWeight: 700 }}>Submissions</div>
        {loading && <div style={ui.hint}>Loading submissions…</div>}
        {error && <div role="alert" style={ui.error}>{error?.message || 'Failed to load submissions.'}</div>}
        {rows.map((s) => (
          <div key={s.id} style={ui.card}>
            <div style={ui.row}>
              <div>
                <div style={{ fontWeight: 700 }}>{s.profiles?.full_name || s.profiles?.email || s.user_id}</div>
                <div style={{ color: '#6B7280', fontSize: 12 }}>
                  Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '—'}
                </div>
                <div style={{ marginTop: 6, color: '#374151' }}>
                  {s.content_text ? <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{s.content_text}</pre> : (s.content_url ? <a href={s.content_url} target="_blank" rel="noreferrer">Open URL</a> : 'No content')}
                </div>
                <div style={{ color: '#6B7280', fontSize: 12, marginTop: 6 }}>
                  Grade: {s.grade_points ?? '—'} {s.graded_at ? `(graded ${new Date(s.graded_at).toLocaleString()})` : ''}
                </div>
                {s.feedback && <div style={{ color: '#374151', fontSize: 14, marginTop: 4 }}>Feedback: {s.feedback}</div>}
              </div>
              {(isAdmin || isInstructor) && (
                <GradeBox
                  onGrade={async (gp, fb) => {
                    await gradeSubmission(s.id, { grade_points: gp, feedback: fb });
                    refresh();
                  }}
                  saving={saving}
                />
              )}
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && <div style={ui.hint}>No submissions yet.</div>}
      </div>
    </section>
  );
}

function StudentSubmissionForm({ onSubmit, saving, errorMsg }) {
  const [content_text, setText] = useState('');
  const [content_url, setUrl] = useState('');
  const ui = {
    label: { display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 },
    btn: { background: 'var(--ocn-primary, #2563EB)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 700, cursor: 'pointer', marginTop: 8 },
    error: { color: '#EF4444', fontSize: 13, marginTop: 6 },
    hint: { color: '#4B5563', fontSize: 13, marginTop: 6 }
  };
  return (
    <div>
      <label style={ui.label}>Text</label>
      <textarea style={{ ...ui.input, minHeight: 100 }} value={content_text} onChange={(e) => setText(e.target.value)} placeholder="Paste text or description of your work" />
      <label style={ui.label}>URL (optional)</label>
      <input style={ui.input} value={content_url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/your-work" />
      {errorMsg && <div role="alert" style={ui.error}>{errorMsg}</div>}
      <button style={ui.btn} disabled={saving} onClick={() => onSubmit({ content_text, content_url })}>
        {saving ? 'Submitting…' : 'Submit'}
      </button>
      <div style={ui.hint}>Either submit text or a URL (or both). You can re-submit to update.</div>
    </div>
  );
}

function GradeBox({ onGrade, saving }) {
  const [gp, setGp] = useState('');
  const [fb, setFb] = useState('');
  const ui = {
    box: { display: 'grid', gap: 6, minWidth: 220 },
    input: { width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 },
    btn: { background: '#fff', color: '#111827', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }
  };
  return (
    <div style={ui.box}>
      <input type="number" min="0" placeholder="Points" style={ui.input} value={gp} onChange={(e) => setGp(Number(e.target.value))} />
      <input placeholder="Feedback" style={ui.input} value={fb} onChange={(e) => setFb(e.target.value)} />
      <button style={ui.btn} disabled={saving} onClick={() => onGrade(gp, fb)}>{saving ? 'Grading…' : 'Grade'}</button>
    </div>
  );
}
