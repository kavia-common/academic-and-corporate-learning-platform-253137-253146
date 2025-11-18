import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * useSupabaseProfile
 * Hook to read the current user's profile from public.profiles using Supabase.
 * Exposes { profile, loading, error, refresh } and role convenience booleans.
 */
export default function useSupabaseProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setError(null);
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase not configured');
      }
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id,email,full_name,role')
        .eq('id', user.id)
        .single();
      if (err) throw err;
      setProfile(data);
    } catch (e) {
      setError(e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isAdmin = profile?.role === 'admin';
  const isInstructor = profile?.role === 'instructor';
  const isStudent = profile?.role === 'student';

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    isAdmin,
    isInstructor,
    isStudent,
  };
}
