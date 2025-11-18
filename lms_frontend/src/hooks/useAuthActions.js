import { useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast/ToastProvider';

/**
 * PUBLIC_INTERFACE
 * useAuthActions returns wrapped auth actions that surface toast notifications.
 */
export default function useAuthActions() {
  const {
    signIn, signUp, signOut, signInWithMagicLink,
    requestPasswordReset, updatePasswordFromToken
  } = useAuth();
  const { showToast } = useToast();

  const withToast = useCallback(async (fn, successMsg) => {
    try {
      const res = await fn();
      if (successMsg) showToast(successMsg, 'success');
      return res;
    } catch (e) {
      showToast(e?.message || 'Operation failed', 'error', { ttl: 6000 });
      throw e;
    }
  }, [showToast]);

  return {
    signIn: (payload) => withToast(() => signIn(payload), 'Signed in'),
    signUp: (payload) => withToast(() => signUp(payload), 'Signup successful, check your email'),
    signOut: () => withToast(() => signOut(), 'Signed out'),
    signInWithMagicLink: (email) => withToast(() => signInWithMagicLink(email), 'Magic link sent to your email'),
    requestPasswordReset: (email) => withToast(() => requestPasswordReset(email), 'Password reset email sent'),
    updatePasswordFromToken: (pwd) => withToast(() => updatePasswordFromToken(pwd), 'Password updated'),
  };
}
