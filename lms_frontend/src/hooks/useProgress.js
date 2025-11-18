import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import useSupabaseProfile from './useSupabaseProfile';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * useProgress
 * Fetch progress by userId or courseId contexts.
 * - If userId provided: student's progress across courses (or specific if courseId also set)
 * - If courseId provided with instructor/admin roles: progress for all students in course
 */
export function useProgress({ userId = null, courseId = null } = {}) {
  const { user } = useAuth();
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId || courseId));
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    setError(null);
    if (!user && !userId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      let query = supabase
        .from('progress')
        .select('id,user_id,course_id,percent_complete,last_activity_at,profiles:profiles!progress_user_id_fkey(id,email,full_name,role),courses:courses!progress_course_id_fkey(id,title)');

      if (userId) {
        // student own progress or admin/instructor viewing a student's progress
        if (isStudent && user && userId !== user.id) {
          // students can only see themselves
          setData([]);
          setLoading(false);
          return;
        }
        query = query.eq('user_id', userId);
      } else if (courseId) {
        // Course-level; instructor/admin can view
        if (!(isAdmin || isInstructor)) {
          setData([]);
          setLoading(false);
          return;
        }
        query = query.eq('course_id', courseId);
      } else if (isStudent && user) {
        // default: student's own across courses
        query = query.eq('user_id', user.id);
      }

      const { data: rows, error: qerr } = await query.order('last_activity_at', { ascending: false });
      if (qerr) throw qerr;
      setData(rows || []);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user, userId, courseId, isAdmin, isInstructor, isStudent]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { data, loading, error, refresh: fetchProgress };
}
