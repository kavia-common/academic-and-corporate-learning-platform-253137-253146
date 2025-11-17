/**
 * AuthProvider and useAuth hook for managing Supabase authentication state.
 * - Tracks session and user via Supabase's onAuthStateChange.
 * - Derives role from user.user_metadata.role with fallback to 'student'.
 * - Exposes signIn, signUp, signOut, resetPassword actions.
 * - Persists session via supabase-js config (see src/supabase/client.js).
 *
 * Usage:
 *   import { AuthProvider, useAuth } from './auth/AuthProvider';
 *   // Wrap App in index.js:
 *   <AuthProvider><App/></AuthProvider>
 *
 *   // In components:
 *   const { user, session, role, status, signIn, signUp, signOut, resetPassword } = useAuth();
 *
 * ENV requirements:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 *
 * SECURITY: Never log sensitive tokens. Errors are generic and user-safe.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import supabase from '../supabase/client';

// Shape of the auth context value
const AuthContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * AuthProvider component to supply authentication state and actions to descendants.
 */
export function AuthProvider({ children }) {
  /**
   * Status can be: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
   */
  const [status, setStatus] = useState('idle');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student'); // default fallback role

  // Derive role from the user object
  const deriveRole = useCallback((u) => {
    if (!u || typeof u !== 'object') return 'student';
    const meta = u.user_metadata || {};
    const r = meta.role;
    // Accept only known roles, default to 'student'
    const allowed = new Set(['admin', 'student']);
    if (typeof r === 'string' && allowed.has(r.toLowerCase())) {
      return r.toLowerCase();
    }
    return 'student';
  }, []);

  // Bootstrap: fetch the current session and subscribe to changes
  useEffect(() => {
    let isMounted = true;
    setStatus('loading');

    const init = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          // eslint-disable-next-line no-console
          console.warn('[Auth] Failed to get initial session');
        }

        if (!isMounted) return;

        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setRole(deriveRole(currentUser));
        setStatus(currentUser ? 'authenticated' : 'unauthenticated');
      } catch (e) {
        if (!isMounted) return;
        setStatus('error');
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);
      setRole(deriveRole(newUser));
      setStatus(newUser ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      isMounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, [deriveRole]);

  /**
   * PUBLIC_INTERFACE
   * Sign in a user with email and password.
   */
  const signIn = useCallback(async ({ email, password }) => {
    setStatus('loading');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus('unauthenticated');
      throw new Error('Unable to sign in. Please verify your credentials.');
    }
    // session will be picked by the onAuthStateChange, but set immediately for UX
    setSession(data.session);
    setUser(data.user ?? data.session?.user ?? null);
    setRole(deriveRole(data.user ?? data.session?.user ?? null));
    setStatus(data.session?.user ? 'authenticated' : 'unauthenticated');
    return data;
  }, [deriveRole]);

  /**
   * PUBLIC_INTERFACE
   * Sign up a new user with email and password.
   * Expects optional metadata including role. If role is not provided, 'student' will be assumed.
   * For email confirmation flows, Supabase may require email verification before session is active.
   */
  const signUp = useCallback(async ({ email, password, options = {} }) => {
    setStatus('loading');

    // Ensure role fallback to 'student' in user_metadata
    const givenMeta = (options.data || options.user_metadata || {});
    const signupMetadata = { role: 'student', ...givenMeta };

    const signUpOptions = {
      ...options,
      // Normalize to supabase v2 option "data"
      data: signupMetadata,
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: signUpOptions,
    });
    if (error) {
      setStatus('unauthenticated');
      throw new Error('Unable to sign up. Please try again later.');
    }

    // If auto-confirm is enabled, session may be present; otherwise, user must confirm email.
    if (data.session?.user) {
      setSession(data.session);
      setUser(data.session.user);
      setRole(deriveRole(data.session.user));
      setStatus('authenticated');
    } else {
      // No session yet, pending email confirmation
      setSession(null);
      setUser(null);
      setRole('student');
      setStatus('unauthenticated');
    }

    return data;
  }, [deriveRole]);

  /**
   * PUBLIC_INTERFACE
   * Sign out the current user from all sessions on this device.
   */
  const signOut = useCallback(async () => {
    setStatus('loading');
    const { error } = await supabase.auth.signOut();
    if (error) {
      setStatus('authenticated'); // remain authenticated if sign out failed
      throw new Error('Unable to sign out. Please try again.');
    }
    setSession(null);
    setUser(null);
    setRole('student');
    setStatus('unauthenticated');
  }, []);

  /**
   * PUBLIC_INTERFACE
   * Send a password reset email to the given address.
   * Note: Ensure REACT_APP_FRONTEND_URL is configured to construct a redirect URL if needed.
   */
  const resetPassword = useCallback(async ({ email, redirectTo }) => {
    // If caller doesn't pass redirectTo, try environment-based default
    const siteUrl = process?.env?.REACT_APP_FRONTEND_URL;
    const emailRedirectTo = redirectTo || (siteUrl ? `${siteUrl}/auth/callback` : undefined);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: emailRedirectTo,
    });
    if (error) {
      throw new Error('Unable to send password reset email. Please try again later.');
    }
    return data;
  }, []);

  const value = useMemo(() => ({
    status,
    session,
    user,
    role,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }), [status, session, user, role, signIn, signUp, signOut, resetPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * React hook to access authentication state and actions.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthProvider;
