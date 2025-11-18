import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import useSupabaseProfile from './useSupabaseProfile';

/**
 * PUBLIC_INTERFACE
 * useEnrollments
 * Fetch enrollments for a course; admin/instructor can manage; student sees own enrollment in that course.
 */
export function useEnrollments(courseId) {
  const { user } = useAuth();
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [error, setError] = useState(null);

  const fetchEnrollments = useCallback(async () => {
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
        .from('enrollments')
        .select('id,course_id,user_id,status,enrolled_at,profiles:profiles!enrollments_user_id_fkey(id,email,full_name,role)')
        .eq('course_id', courseId);

      if (isStudent && user) {
        query = query.eq('user_id', user.id);
      }

      const { data: rows, error: qerr } = await query.order('enrolled_at', { ascending: false });
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
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { data, loading, error, refresh: fetchEnrollments };
}

/**
 * PUBLIC_INTERFACE
 * useEnrollmentMutations
 * Manage enrollments (add/remove/update status). Only admin/instructor allowed.
 */
export function useEnrollmentMutations(courseId, { onLocalUpdate } = {}) {
  const { isAdmin, isInstructor } = useSupabaseProfile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const canEdit = Boolean(isAdmin || isInstructor);

  const addEnrollment = useCallback(
    async (userId, status = 'active') => {
      if (!canEdit) throw new Error('Not authorized to manage enrollments');
      if (!courseId) throw new Error('Missing courseId');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      const temp = {
        id: `temp-${Date.now()}`,
        course_id: courseId,
        user_id: userId,
        status,
        enrolled_at: new Date().toISOString(),
        profiles: null,
      };
      onLocalUpdate && onLocalUpdate((prev) => [temp, ...prev]);

      try {
        const { data, error: err } = await supabase
          .from('enrollments')
          .insert([{ course_id: courseId, user_id: userId, status }])
          .select('id,course_id,user_id,status,enrolled_at')
          .single();
        if (err) throw err;
        onLocalUpdate &&
          onLocalUpdate((prev) => [data, ...prev.filter((e) => e.id !== temp.id)]);
        return { data };
      } catch (e) {
        onLocalUpdate && onLocalUpdate((prev) => prev.filter((en) => en.id !== temp.id));
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [canEdit, courseId, onLocalUpdate]
  );

  const updateEnrollment = useCallback(
    async (id, patch) => {
      if (!canEdit) throw new Error('Not authorized to update enrollments');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      let prevRow = null;
      onLocalUpdate &&
        onLocalUpdate((prev) => {
          const idx = prev.findIndex((e) => e.id === id);
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
          .from('enrollments')
          .update({ ...patch })
          .eq('id', id)
          .select('id,course_id,user_id,status,enrolled_at')
          .single();
        if (err) throw err;
        onLocalUpdate &&
          onLocalUpdate((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
        return { data };
      } catch (e) {
        if (prevRow) {
          onLocalUpdate && onLocalUpdate((prev) => prev.map((x) => (x.id === id ? prevRow : x)));
        }
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [canEdit, onLocalUpdate]
  );

  const removeEnrollment = useCallback(
    async (id) => {
      if (!canEdit) throw new Error('Not authorized to remove enrollments');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      let removed = null;
      onLocalUpdate &&
        onLocalUpdate((prev) => {
          removed = prev.find((e) => e.id === id) || null;
          return prev.filter((e) => e.id !== id);
        });

      try {
        const { error: err } = await supabase.from('enrollments').delete().eq('id', id);
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

  return { addEnrollment, updateEnrollment, removeEnrollment, saving, error, canEdit };
}
