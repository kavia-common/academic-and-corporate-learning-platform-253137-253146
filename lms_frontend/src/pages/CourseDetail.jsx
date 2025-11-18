import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAssignments, useAssignmentMutations } from '../hooks/useAssignments';
import { useEnrollments, useEnrollmentMutations } from '../hooks/useEnrollments';
import { useProgress } from '../hooks/useProgress';
import useSupabaseProfile from '../hooks/useSupabaseProfile';

/**
 * PUBLIC_INTERFACE
 * CourseDetail page: shows tabs for Assignments, Enrollments, Progress.
 * - Admin/Instructor can manage assignments and enrollments
 * - Students can view assignments and their own progress
 */
export default function CourseDetail() {
  const { id: courseId } = useParams();
  const [tab, setTab] = useState('assignments');
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();

  // Assignments
  const [assignmentRows, setAssignmentRows] = useState([]);
  const { data: assignments, loading: aLoading, error: aError, refresh: aRefresh } = useAssignments(courseId);
  const {
    createAssignment,
    updateAssignment,
    deleteAssignment,
    saving: aSaving,
    error: aSaveErr,
    canEdit: aCanEdit
  } = useAssignmentMutations(courseId, { onLocalUpdate: setAssignmentRows });

  useMemo(() => setAssignmentRows(assignments || []), [assignments]);

  // Enrollments
  const [enrollmentRows, setEnrollmentRows] = useState([]);
  const { data: enrollments, loading: eLoading, error: eError, refresh: eRefresh } = useEnrollments(courseId);
  const { addEnrollment, updateEnrollment, removeEnrollment, saving: eSaving, error: eSaveErr, canEdit: eCanEdit } =
    useEnrollmentMutations(courseId, { onLocalUpdate: setEnrollmentRows });
  useMemo(() => setEnrollmentRows(enrollments || []), [enrollments]);

  // Progress (course scoped)
  const { data: courseProgress, loading: pLoading, error: pError, refresh: pRefresh } = useProgress({ courseId });

  const ui = {
    page: { maxWidth: 980, margin: '0 auto' },
    headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { font: '800 22px/28px "Helvetica Neue", Arial, sans-serif', color: '#111827', margin: 0 },
    tabs: { display: 'flex', gap: 8, marginBottom: 16 },
    tabBtn: (active) => ({
      background: active ? 'var(--ocn-primary, #2563EB)' : '#fff',
      color: active ? '#fff' : '#111827',
      border: '1px solid #E5E7EB',
      borderRadius: 10,
      padding: '8px 12px',
      fontWeight: 700,
      cursor: 'pointer'
    }),
    card: {
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14,
      boxShadow: 'var(--ocn-shadow-1, 0 4px 12px rgba(12,32,80,0.08))'
    },
    grid: { display: 'grid', gap: 10 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 },
    label: { display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 },
    btn: {
      background: 'var(--ocn-primary, #2563EB)', color: '#fff', border: 'none', borderRadius: 10,
      padding: '8px 12px', fontWeight: 700, cursor: 'pointer'
    },
    ghost: { background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' },
    hint: { color: '#4B5563', fontSize: 13, marginTop: 6 },
    error: { color: '#EF4444', fontSize: 13, marginBottom: 8 },
    row: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center' }
  };

  return (
    <section style={ui.page}>
      <div style={ui.headerRow}>
        <h1 style={ui.title}>Course</h1>
        <Link to="/courses" style={{ textDecoration: 'none' }}>
          <button style={ui.ghost}>Back</button>
        </Link>
      </div>

      <div style={ui.tabs}>
        <button style={ui.tabBtn(tab === 'assignments')} onClick={() => setTab('assignments')}>Assignments</button>
        <button style={ui.tabBtn(tab === 'enrollments')} onClick={() => setTab('enrollments')}>Enrollments</button>
        <button style={ui.tabBtn(tab === 'progress')} onClick={() => setTab('progress')}>Progress</button>
      </div>

      {tab === 'assignments' && (
        <div style={ui.grid}>
          {(aLoading) && <div style={ui.hint}>Loading assignments…</div>}
          {aError && <div role="alert" style={ui.error}>{aError?.message || 'Failed to load assignments.'}</div>}
          <div>
            {(isAdmin || isInstructor) && (
              <AssignmentEditor
                onSave={async (payload) => {
                  await createAssignment(payload);
                  aRefresh();
                }}
                saving={aSaving}
                errorMsg={aSaveErr?.message}
              />
            )}
          </div>
          <div className="assignment-list" style={ui.grid}>
            {assignmentRows.map((a) => (
              <div key={a.id} style={ui.card}>
                <div style={ui.row}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.title}</div>
                    <div style={{ color: '#4B5563', fontSize: 14 }}>{a.description || '—'}</div>
                    <div style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>
                      Due: {a.due_at ? new Date(a.due_at).toLocaleString() : '—'} • Max: {a.max_points ?? '—'}
                    </div>
                  </div>
                  {(isAdmin || isInstructor) && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/assignments/${a.id}`} style={{ textDecoration: 'none' }}>
                        <button style={ui.ghost}>Submissions</button>
                      </Link>
                      <button
                        style={ui.ghost}
                        onClick={async () => {
                          // quick edit prompt
                          const newTitle = window.prompt('Update title', a.title);
                          if (newTitle != null) {
                            await updateAssignment(a.id, { title: newTitle });
                            aRefresh();
                          }
                        }}
                      >
                        Edit
                      </button>
                      <button
                        style={{ ...ui.ghost, color: '#EF4444', borderColor: '#FECACA' }}
                        onClick={async () => {
                          if (window.confirm('Delete this assignment?')) {
                            await deleteAssignment(a.id);
                            aRefresh();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!aLoading && assignmentRows.length === 0 && <div style={ui.hint}>No assignments yet.</div>}
          </div>
        </div>
      )}

      {tab === 'enrollments' && (
        <div style={ui.grid}>
          {(eLoading) && <div style={ui.hint}>Loading enrollments…</div>}
          {eError && <div role="alert" style={ui.error}>{eError?.message || 'Failed to load enrollments.'}</div>}
          {(isAdmin || isInstructor) && (
            <div style={ui.card}>
              <div style={{ marginBottom: 10, fontWeight: 700 }}>Add enrollment</div>
              <EnrollmentAdder onAdd={addEnrollment} saving={eSaving} errorMsg={eSaveErr?.message} />
            </div>
          )}
          <div style={ui.grid}>
            {enrollmentRows.map((en) => (
              <div key={en.id} style={ui.card}>
                <div style={ui.row}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{en.profiles?.full_name || en.profiles?.email || en.user_id}</div>
                    <div style={{ color: '#6B7280', fontSize: 12 }}>
                      Status: {en.status} • Enrolled: {en.enrolled_at ? new Date(en.enrolled_at).toLocaleDateString() : '—'}
                    </div>
                  </div>
                  {(isAdmin || isInstructor) && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        style={ui.ghost}
                        onClick={async () => {
                          const next = window.prompt('Update status (active|dropped|completed)', en.status);
                          if (next) await updateEnrollment(en.id, { status: next });
                          eRefresh();
                        }}
                      >
                        Update
                      </button>
                      <button
                        style={{ ...ui.ghost, color: '#EF4444', borderColor: '#FECACA' }}
                        onClick={async () => {
                          if (window.confirm('Remove enrollment?')) {
                            await removeEnrollment(en.id);
                            eRefresh();
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!eLoading && enrollmentRows.length === 0 && <div style={ui.hint}>No enrollments yet.</div>}
          </div>
        </div>
      )}

      {tab === 'progress' && (
        <div style={ui.grid}>
          {(pLoading) && <div style={ui.hint}>Loading progress…</div>}
          {pError && <div role="alert" style={ui.error}>{pError?.message || 'Failed to load progress.'}</div>}
          {courseProgress.map((pr) => (
            <div key={pr.id} style={ui.card}>
              <div style={ui.row}>
                <div>
                  <div style={{ fontWeight: 700 }}>{pr.profiles?.full_name || pr.profiles?.email || pr.user_id}</div>
                  <div style={{ color: '#6B7280', fontSize: 12 }}>
                    {Math.round(pr.percent_complete ?? 0)}% • Last activity: {pr.last_activity_at ? new Date(pr.last_activity_at).toLocaleString() : '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!pLoading && courseProgress.length === 0 && <div style={ui.hint}>No progress records.</div>}
        </div>
      )}

      {isStudent && tab !== 'enrollments' && (
        <p style={ui.hint}>Students can submit assignments under each assignment and view their progress.</p>
      )}
    </section>
  );
}

function AssignmentEditor({ onSave, saving, errorMsg }) {
  const [form, setForm] = useState({ title: '', description: '', due_at: '', max_points: 100 });
  const ui = {
    label: { display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
    btn: {
      background: 'var(--ocn-primary, #2563EB)', color: '#fff', border: 'none', borderRadius: 10,
      padding: '8px 12px', fontWeight: 700, cursor: 'pointer', marginTop: 8
    },
    error: { color: '#EF4444', fontSize: 13, marginTop: 6 },
    card: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14 }
  };
  return (
    <div style={ui.card}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Create assignment</div>
      <label style={ui.label}>Title</label>
      <input style={ui.input} value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
      <label style={ui.label}>Description</label>
      <textarea style={{ ...ui.input, minHeight: 80 }} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
      <div style={ui.row}>
        <div>
          <label style={ui.label}>Due at</label>
          <input type="datetime-local" style={ui.input} value={form.due_at} onChange={(e) => setForm((s) => ({ ...s, due_at: e.target.value }))} />
        </div>
        <div>
          <label style={ui.label}>Max points</label>
          <input type="number" min="0" style={ui.input} value={form.max_points} onChange={(e) => setForm((s) => ({ ...s, max_points: Number(e.target.value) }))} />
        </div>
      </div>
      {errorMsg && <div role="alert" style={ui.error}>{errorMsg}</div>}
      <button style={ui.btn} disabled={saving} onClick={() => onSave(form)}>{saving ? 'Saving…' : 'Create'}</button>
    </div>
  );
}

function EnrollmentAdder({ onAdd, saving, errorMsg }) {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState('active');
  const ui = {
    label: { display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end' },
    btn: { background: 'var(--ocn-primary, #2563EB)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' },
    error: { color: '#EF4444', fontSize: 13, marginTop: 6 },
  };

  return (
    <>
      <div style={ui.row}>
        <div>
          <label style={ui.label}>User ID</label>
          <input style={ui.input} value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="paste user UUID" />
        </div>
        <div>
          <label style={ui.label}>Status</label>
          <select style={ui.input} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="dropped">dropped</option>
            <option value="completed">completed</option>
          </select>
        </div>
        <button className="btn" style={ui.btn} disabled={saving} onClick={async () => { if (userId) await onAdd(userId, status); }}>
          {saving ? 'Adding…' : 'Add'}
        </button>
      </div>
      {errorMsg && <div role="alert" style={ui.error}>{errorMsg}</div>}
    </>
  );
}
