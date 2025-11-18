import React, { useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourses, useCourseMutations } from '../hooks/useCourses';
import useSupabaseProfile from '../hooks/useSupabaseProfile';

/**
 * PUBLIC_INTERFACE
 * Courses page
 * - Lists courses visible to the user based on role (admin/instructor/student)
 * - Admin/Instructor can create/edit/delete
 * - Students see courses they are enrolled in
 */
export default function Courses() {
  const [rows, setRows] = useState([]);
  const { data, loading, error, refresh } = useCourses();
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();
  const { createCourse, updateCourse, deleteCourse, saving, error: saveError, canEdit } =
    useCourseMutations({ onLocalUpdate: setRows });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', published: false });
  const navigate = useNavigate();

  useMemo(() => {
    setRows(data || []);
  }, [data]);

  const openCreate = useCallback(() => {
    setEditRow(null);
    setForm({ title: '', description: '', published: false });
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row) => {
    setEditRow(row);
    setForm({ title: row.title || '', description: row.description || '', published: !!row.published });
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditRow(null);
  }, []);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (editRow) {
        await updateCourse(editRow.id, form);
      } else {
        await createCourse(form);
      }
      setDialogOpen(false);
      setEditRow(null);
      refresh();
    } catch {
      // handled via saveError and minimal feedback
    }
  }, [editRow, form, updateCourse, createCourse, refresh]);

  const ui = {
    page: { maxWidth: 900, margin: '0 auto' },
    headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    title: { font: '800 22px/28px "Helvetica Neue", Arial, sans-serif', color: '#111827', margin: 0 },
    createBtn: {
      background: 'var(--ocn-primary, #2563EB)', color: '#fff', border: 'none', borderRadius: 10,
      padding: '10px 14px', fontWeight: 700, cursor: 'pointer'
    },
    list: { display: 'grid', gap: 12 },
    card: {
      background: 'var(--ocn-surface, #fff)',
      border: '1px solid var(--ocn-border, #E5E7EB)',
      borderRadius: 12,
      padding: 16,
      boxShadow: 'var(--ocn-shadow-1, 0 4px 12px rgba(12,32,80,0.08))',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: 12
    },
    actions: { display: 'inline-flex', gap: 8 },
    ghostBtn: {
      background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer'
    },
    dangerBtn: {
      background: '#fff', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 10px', cursor: 'pointer'
    },
    dialog: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(17,24,39,0.4)',
      display: 'grid',
      placeItems: 'center',
      padding: 20,
      zIndex: 100,
    },
    modal: {
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #E5E7EB',
      width: '100%',
      maxWidth: 520,
      padding: 20,
    },
    field: { marginBottom: 12 },
    label: { display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 },
    rowActions: { display: 'flex', gap: 8 },
    hint: { color: '#4B5563', fontSize: 13, marginBottom: 8 },
    error: { color: '#EF4444', fontSize: 13, marginBottom: 8 },
  };

  return (
    <section style={ui.page}>
      <div style={ui.headerRow}>
        <h1 style={ui.title}>Courses</h1>
        {canEdit && (
          <button style={ui.createBtn} onClick={openCreate}>
            New Course
          </button>
        )}
      </div>

      {loading && <div aria-busy="true" style={ui.hint}>Loading courses…</div>}
      {error && (
        <div role="alert" style={ui.error}>
          {error?.message || 'Failed to load courses (check RLS policies or connectivity).'}
        </div>
      )}
      {!loading && rows.length === 0 && <div style={ui.hint}>No courses yet.</div>}

      <div style={ui.list}>
        {rows.map((c) => (
          <div key={c.id} style={ui.card}>
            <div>
              <div style={{ fontWeight: 700 }}>{c.title}</div>
              <div style={{ color: '#4B5563', fontSize: 14 }}>{c.description || '—'}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
                {c.published ? 'Published' : 'Draft'}
              </div>
            </div>
            <div style={ui.actions}>
              <Link to={`/courses/${c.id}`} style={{ textDecoration: 'none' }}>
                <button style={ui.ghostBtn}>Open</button>
              </Link>
              {canEdit && (
                <>
                  <button style={ui.ghostBtn} onClick={() => openEdit(c)}>Edit</button>
                  <button
                    style={ui.dangerBtn}
                    onClick={async () => {
                      try {
                        await deleteCourse(c.id);
                      } catch {}
                    }}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {dialogOpen && (
        <div role="dialog" aria-modal="true" style={ui.dialog} onClick={closeDialog}>
          <div style={ui.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ ...ui.title, fontSize: 18 }}>{editRow ? 'Edit course' : 'Create course'}</h2>
            {saveError && <div role="alert" style={ui.error}>{saveError?.message || 'Save failed.'}</div>}
            <form onSubmit={onSubmit}>
              <div style={ui.field}>
                <label style={ui.label} htmlFor="title">Title</label>
                <input
                  id="title"
                  style={ui.input}
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  required
                />
              </div>
              <div style={ui.field}>
                <label style={ui.label} htmlFor="desc">Description</label>
                <textarea
                  id="desc"
                  style={{ ...ui.input, minHeight: 80 }}
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              <div style={{ ...ui.field, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="published"
                  type="checkbox"
                  checked={!!form.published}
                  onChange={(e) => setForm((s) => ({ ...s, published: e.target.checked }))}
                />
                <label htmlFor="published" style={{ fontSize: 14 }}>Published</label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" style={ui.ghostBtn} onClick={closeDialog}>Cancel</button>
                <button type="submit" style={ui.createBtn} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStudent && (
        <p style={{ ...ui.hint, marginTop: 16 }}>
          Students can view enrolled courses only. Contact your instructor for access.
        </p>
      )}
    </section>
  );
}
