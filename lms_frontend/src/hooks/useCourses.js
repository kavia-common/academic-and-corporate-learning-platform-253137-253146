import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import useSupabaseProfile from './useSupabaseProfile';

/**
 * PUBLIC_INTERFACE
 * useCourses
 * Fetch list of courses according to role:
 * - admin: all courses
 * - instructor: courses where created_by = current user
 * - student: courses where enrolled (via enrollments)
 */
export function useCourses() {
  const { user } = useAuth();
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setError(null);
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      let query = supabase.from('courses').select('id,title,description,created_by,published,created_at,updated_at');

      if (isAdmin) {
        // no additional filter, RLS should allow admin
      } else if (isInstructor) {
        query = query.eq('created_by', user.id);
      } else if (isStudent) {
        // join-like using in operator on course_id where enrollments contain user
        // Use a subquery via RPC-like filter using .in with list from enrollments
        const { data: enrolls, error: enrErr } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id);
        if (enrErr) throw enrErr;
        const ids = (enrolls || []).map((e) => e.course_id);
        if (ids.length > 0) {
          query = query.in('id', ids);
        } else {
          setData([]);
          setLoading(false);
          return;
        }
      }

      const { data: rows, error: qerr } = await query.order('created_at', { ascending: false });
      if (qerr) throw qerr;
      setData(rows || []);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, isInstructor, isStudent]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { data, loading, error, refresh: fetchCourses };
}

/**
 * PUBLIC_INTERFACE
 * useCourseMutations
 * Create, update, and delete courses. Implements optimistic UI update patterns.
 */
export function useCourseMutations({ onLocalUpdate } = {}) {
  const { user } = useAuth();
  const { isAdmin, isInstructor } = useSupabaseProfile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canEdit = Boolean(user && (isAdmin || isInstructor));

  const createCourse = useCallback(
    async (payload) => {
      if (!canEdit) throw new Error('Not authorized to create courses');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      // optimistic local
      const temp = { ...payload, id: `temp-${Date.now()}`, created_by: user.id, published: !!payload.published };
      onLocalUpdate && onLocalUpdate((prev) => [temp, ...prev]);

      try {
        const { data, error: err } = await supabase
          .from('courses')
          .insert([{ ...payload, created_by: user.id }])
          .select('id,title,description,created_by,published,created_at,updated_at')
          .single();
        if (err) throw err;
        // reconcile temp by replacing it with committed
        onLocalUpdate && onLocalUpdate((prev) => [data, ...prev.filter((c) => c.id !== temp.id)]);
        return { data };
      } catch (e) {
        // rollback optimistic
        onLocalUpdate && onLocalUpdate((prev) => prev.filter((c) => c.id !== temp.id));
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [canEdit, onLocalUpdate, user]
  );

  const updateCourse = useCallback(
    async (id, patch) => {
      if (!canEdit) throw new Error('Not authorized to update courses');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      // optimistic patch
      let prevRow = null;
      onLocalUpdate &&
        onLocalUpdate((prev) => {
          const idx = prev.findIndex((c) => c.id === id);
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
          .from('courses')
          .update({ ...patch })
          .eq('id', id)
          .select('id,title,description,created_by,published,created_at,updated_at')
          .single();
        if (err) throw err;
        onLocalUpdate &&
          onLocalUpdate((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
        return { data };
      } catch (e) {
        // rollback
        if (prevRow) {
          onLocalUpdate &&
            onLocalUpdate((prev) => prev.map((c) => (c.id === id ? prevRow : c)));
        }
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [canEdit, onLocalUpdate]
  );

  const deleteCourse = useCallback(
    async (id) => {
      if (!canEdit) throw new Error('Not authorized to delete courses');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      // optimistic remove
      let removed = null;
      onLocalUpdate &&
        onLocalUpdate((prev) => {
          const found = prev.find((c) => c.id === id);
          removed = found || null;
          return prev.filter((c) => c.id !== id);
        });

      try {
        const { error: err } = await supabase.from('courses').delete().eq('id', id);
        if (err) throw err;
        return { success: true };
      } catch (e) {
        // rollback
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

  return { createCourse, updateCourse, deleteCourse, saving, error, canEdit };
}
