import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import useSupabaseProfile from './useSupabaseProfile';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * useSubmissions
 * Load submissions for an assignment. Students see their own; instructors/admin see all for the course assignment.
 */
export function useSubmissions(assignmentId) {
  const { user } = useAuth();
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(assignmentId));
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    if (!assignmentId) {
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
        .from('submissions')
        .select('id,assignment_id,user_id,submitted_at,content_url,content_text,grade_points,graded_at,feedback,profiles:profiles!submissions_user_id_fkey(id,email,full_name)')
        .eq('assignment_id', assignmentId);

      if (isStudent && user) {
        query = query.eq('user_id', user.id);
      }

      const { data: rows, error: qerr } = await query.order('submitted_at', { ascending: false });
      if (qerr) throw qerr;
      setData(rows || []);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, isStudent, user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { data, loading, error, refresh: fetchSubmissions };
}

/**
 * PUBLIC_INTERFACE
 * useSubmissionMutations
 * Students submit/update their own submission. Instructors/Admin can grade.
 */
export function useSubmissionMutations(assignmentId, { onLocalUpdate } = {}) {
  const { user } = useAuth();
  const { isAdmin, isInstructor, isStudent } = useSupabaseProfile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submitWork = useCallback(
    async ({ content_url, content_text }) => {
      if (!isStudent || !user) throw new Error('Only students can submit work');
      if (!assignmentId) throw new Error('Missing assignmentId');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      // Check if a submission exists (unique by assignment_id, user_id)
      const { data: existing, error: exErr } = await supabase
        .from('submissions')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (exErr) {
        setSaving(false);
        setError(exErr);
        throw exErr;
      }

      const payload = {
        assignment_id: assignmentId,
        user_id: user.id,
        content_url: content_url || null,
        content_text: content_text || null,
        submitted_at: new Date().toISOString(),
      };

      let temp = null;
      if (!existing) {
        temp = { ...payload, id: `temp-${Date.now()}` };
        onLocalUpdate && onLocalUpdate((prev) => [temp, ...prev]);
      } else {
        // optimistic patch for existing
        onLocalUpdate &&
          onLocalUpdate((prev) =>
            prev.map((s) => (s.id === existing.id ? { ...s, ...payload } : s))
          );
      }

      try {
        let res;
        if (!existing) {
          res = await supabase
            .from('submissions')
            .insert([payload])
            .select('id,assignment_id,user_id,submitted_at,content_url,content_text,grade_points,graded_at,feedback')
            .single();
        } else {
          res = await supabase
            .from('submissions')
            .update(payload)
            .eq('id', existing.id)
            .select('id,assignment_id,user_id,submitted_at,content_url,content_text,grade_points,graded_at,feedback')
            .single();
        }
        if (res.error) throw res.error;
        const data = res.data;
        onLocalUpdate &&
          onLocalUpdate((prev) => {
            const filtered = prev.filter((s) => s.id !== (temp ? temp.id : data.id));
            return [data, ...filtered];
          });
        return { data };
      } catch (e) {
        // rollback: remove temp or revert patch not strictly necessary here
        if (temp) {
          onLocalUpdate && onLocalUpdate((prev) => prev.filter((s) => s.id !== temp.id));
        }
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [assignmentId, isStudent, onLocalUpdate, user]
  );

  const gradeSubmission = useCallback(
    async (submissionId, { grade_points, feedback }) => {
      if (!(isAdmin || isInstructor)) throw new Error('Only instructors or admins can grade');
      setSaving(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error('Supabase not configured');

      let prevRow = null;
      onLocalUpdate &&
        onLocalUpdate((prev) => {
          const idx = prev.findIndex((s) => s.id === submissionId);
          if (idx >= 0) {
            prevRow = prev[idx];
            const next = [...prev];
            next[idx] = { ...prev[idx], grade_points, feedback, graded_at: new Date().toISOString() };
            return next;
          }
          return prev;
        });

      try {
        const { data, error: err } = await supabase
          .from('submissions')
          .update({ grade_points, feedback, graded_at: new Date().toISOString() })
          .eq('id', submissionId)
          .select('id,assignment_id,user_id,submitted_at,content_url,content_text,grade_points,graded_at,feedback')
          .single();
        if (err) throw err;
        onLocalUpdate &&
          onLocalUpdate((prev) => prev.map((s) => (s.id === submissionId ? { ...s, ...data } : s)));
        return { data };
      } catch (e) {
        if (prevRow) {
          onLocalUpdate && onLocalUpdate((prev) => prev.map((s) => (s.id === submissionId ? prevRow : s)));
        }
        setError(e);
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [isAdmin, isInstructor, onLocalUpdate]
  );

  return { submitWork, gradeSubmission, saving, error };
}
