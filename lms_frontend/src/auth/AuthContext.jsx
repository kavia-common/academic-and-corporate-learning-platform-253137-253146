import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getEnv } from '../config/env';
import { getSupabaseClient } from '../lib/supabase';

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  /** Auth context providing user, session, loading, and auth actions */
  user: null,
  session: null,
  loading: true,
  signIn: async (_payload) => {},
  signUp: async (_payload) => {},
  signOut: async () => {},
  refreshSession: async () => {},
  isConfigured: false,
  configWarning: '',
});

/**
 * PUBLIC_INTERFACE
 * AuthProvider initializes Supabase auth (if configured) and exposes auth state and actions.
 * - Reads REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY from env (via getEnv).
 * - If env is missing, it works gracefully and shows helpful hints on auth pages.
 */
export function AuthProvider({ children }) {
  const { SUPABASE_URL, SUPABASE_KEY, FRONTEND_URL } = getEnv();
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
  const configWarning = useMemo(() => {
    if (!isConfigured) {
      // eslint-disable-next-line no-console
      console.warn(
        '[auth] Supabase env missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY to enable authentication.'
      );
      return 'Supabase is not configured. Contact the administrator to set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.';
    }
    return '';
  }, [isConfigured]);

  // Lazy init Supabase client
  useEffect(() => {
    let unsub = null;
    let mounted = true;

    async function init() {
      setLoading(true);
      const client = await getSupabaseClient();
      if (!mounted) return;
      if (!client) {
        setSupabase(null);
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setSupabase(client);

      // Fetch initial session
      const {
        data: { session: initialSession },
        error: sessErr,
      } = await client.auth.getSession();
      if (sessErr) {
        // eslint-disable-next-line no-console
        console.warn('[auth] getSession error', sessErr.message);
      }
      if (!mounted) return;
      setSession(initialSession || null);
      setUser(initialSession?.user || null);
      setLoading(false);

      // Subscribe to auth changes
      const { data: listener } = client.auth.onAuthStateChange((_event, s) => {
        setSession(s || null);
        setUser(s?.user || null);
      });

      unsub = () => {
        listener?.subscription?.unsubscribe?.();
      };
    }

    init();

    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      if (!supabase) {
        throw new Error('Authentication is not configured.');
      }
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      return data;
    },
    [supabase]
  );

  const signUp = useCallback(
    async ({ email, password }) => {
      if (!supabase) {
        throw new Error('Authentication is not configured.');
      }
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }
      // For email confirmation flows, use emailRedirectTo to FRONTEND_URL or window.location.origin
      const emailRedirectTo =
        FRONTEND_URL && FRONTEND_URL.startsWith('http')
          ? `${FRONTEND_URL}/auth/login`
          : `${window.location.origin}/auth/login`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      });
      if (error) throw error;
      return data;
    },
    [supabase, FRONTEND_URL]
  );

  const signOut = useCallback(async () => {
    if (!supabase) {
      // idempotent
      setSession(null);
      setUser(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    setSession(data.session);
    setUser(data.session?.user || null);
    return data.session;
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      refreshSession,
      isConfigured,
      configWarning,
    }),
    [user, session, loading, signIn, signUp, signOut, refreshSession, isConfigured, configWarning]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Returns the AuthContext hook for components */
  return useContext(AuthContext);
}
