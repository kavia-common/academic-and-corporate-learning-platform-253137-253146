import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import useSupabaseProfile from './useSupabaseProfile';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * useAssignments
 * Fetch list of assignments for a given courseId, respecting role:
 * - admin/instructor with access to course can see all
 * - student sees those in their enrolled course
 */
export function useAssignments(courseId) {
  const { user } = useAuth();
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!courseId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      let query = supabase
        .from('assignments')
        .select('id,course_id,title,description,due_at,max_points,created_at,updated_at')
        .eq('course_id', courseId);

      // RLS expected to restrict based on role; we still filter defensively for student
      if (isStudent && user) {
        const { data: enr, error: enrErr } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .single();
        if (enrErr || !enr) {
          setData([]);
          setLoading(false);
          return;
        }
      }

      const { data: rows, error: qerr } = await query.order('due_at', { ascending: true });
      if (qerr) throw qerr;
      setData(rows || []);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, isStudent, user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { data, loading, error, refresh: fetchAssignments };
}

/**
 * PUBLIC_INTERFACE
 * useAssignmentMutations
 * Create/update/delete assignment records. Only admin/instructor allowed.
 */
export function useAssignmentMutations(courseId, { onLocalUpdate } = {}) {
  const { user } = useAuth();
  const { isAdmin, isInstructor } = useSupabaseProfile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const canEdit = Boolean(user && (isAdmin || isInstructor));

  const createAssignment = useCallback(
    async (payload) => {
      if (!canEdit) throw new Error('Not authorized to create assignments');
      if (!courseId) throw new Error('Missing courseId');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      const temp = { ...payload, id: `temp-${Date.now()}`, course_id: courseId };
      onLocalUpdate && onLocalUpdate((prev) => [temp, ...prev]);

      try {
        const { data, error: err } = await supabase
          .from('assignments')
          .insert([{ ...payload, course_id: courseId }])
          .select('id,course_id,title,description,due_at,max_points,created_at,updated_at')
          .single();
        if (err) throw err;
        onLocalUpdate && onLocalUpdate((prev) => [data, ...prev.filter((a) => a.id !== temp.id)]);
        return { data };
      } catch (e) {
        onLocalUpdate && onLocalUpdate((prev) => prev.filter((a) => a.id !== temp.id));
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [canEdit, courseId, onLocalUpdate]
  );

  const updateAssignment = useCallback(
    async (id, patch) => {
      if (!canEdit) throw new Error('Not authorized to update assignments');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      let prevRow = null;
      onLocalUpdate &&
        onLocalUpdate((prev) => {
          const idx = prev.findIndex((a) => a.id === id);
          if (idx >= 0) {
            prevRow = prev[idx];
            const next = [...prev];
            next[idx] = { ...prev[idx], ...patch };
            return next;
          }
          return prev;
        });

      try {
        const { data, error: err } = await supabase
          .from('assignments')
          .update({ ...patch })
          .eq('id', id)
          .select('id,course_id,title,description,due_at,max_points,created_at,updated_at')
          .single();
        if (err) throw err;
        onLocalUpdate &&
          onLocalUpdate((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
        return { data };
      } catch (e) {
        if (prevRow) {
          onLocalUpdate && onLocalUpdate((prev) => prev.map((a) => (a.id === id ? prevRow : a)));
        }
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [canEdit, onLocalUpdate]
  );

  const deleteAssignment = useCallback(
    async (id) => {
      if (!canEdit) throw new Error('Not authorized to delete assignments');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      let removed = null;
      onLocalUpdate &&
        onLocalUpdate((prev) => {
          removed = prev.find((a) => a.id === id) || null;
          return prev.filter((a) => a.id !== id);
        });

      try {
        const { error: err } = await supabase.from('assignments').delete().eq('id', id);
        if (err) throw err;
        return { success: true };
      } catch (e) {
        if (removed) {
          onLocalUpdate && onLocalUpdate((prev) => [removed, ...prev]);
        }
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [canEdit, onLocalUpdate]
  );

  return { createAssignment, updateAssignment, deleteAssignment, saving, error, canEdit };
}
