import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import useAuthActions from '../../hooks/useAuthActions';

const styles = {
  page: {
    minHeight: 'calc(100vh - 56px)',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--ocn-bg-canvas, #F5F7FB)',
    padding: 24,
  },
  card: {
    background: 'var(--ocn-surface, #fff)',
    border: '1px solid var(--ocn-border, #E5E7EB)',
    borderRadius: 12,
    boxShadow: 'var(--ocn-shadow-1, 0 4px 12px rgba(12, 32, 80, 0.08))',
    width: '100%',
    maxWidth: 420,
    padding: 24,
  },
  title: {
    font: '800 22px/28px "Helvetica Neue", Arial, sans-serif',
    color: 'var(--ocn-text, #111827)',
    margin: '0 0 12px',
  },
  subtitle: {
    color: 'var(--ocn-text-muted, #4B5563)',
    marginBottom: 16,
    font: '500 14px/20px "Helvetica Neue", Arial, sans-serif',
  },
  label: {
    display: 'block',
    font: '600 13px/18px "Helvetica Neue", Arial, sans-serif',
    color: '#111827',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    outline: 'none',
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--ocn-primary, #2563EB)',
    color: '#fff',
    font: '700 14px/20px "Helvetica Neue", Arial, sans-serif',
    cursor: 'pointer',
    marginTop: 6,
  },
  linkRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 12,
    fontSize: 14,
  },
  rowLinks: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 8,
    fontSize: 14,
    gap: 10,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 8,
  },
  hint: {
    background: '#FFF7ED',
    border: '1px solid #FED7AA',
    color: '#9A3412',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  notice: {
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#065F46',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 12,
  },
};

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

/**
 * PUBLIC_INTERFACE
 * Login page for email/password authentication via Supabase Auth with guidance for unverified accounts.
 */
export default function Login() {
  const { isConfigured, configWarning, isEmailVerified } = useAuth();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const q = useQuery();
  const next = q.get('next') || '/';

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!isConfigured) {
      setError('Authentication is not configured for this environment.');
      return;
    }
    try {
      setSubmitting(true);
      await signIn({ email, password });
      // If user is not email-verified, we still sign in, but show guidance
      if (!isEmailVerified) {
        // Navigate but rely on toast; not blocking
        navigate(next, { replace: true });
      } else {
        navigate(next, { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Failed to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={onSubmit} aria-labelledby="login-title">
        <h1 id="login-title" style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to continue to the LMS.</p>
        {!isConfigured && <div role="alert" style={styles.hint}>{configWarning}</div>}
        {!isEmailVerified && (
          <div role="status" style={styles.notice}>
            Your email is not verified yet. Check your inbox for a confirmation email.
          </div>
        )}
        {error && <div role="alert" style={styles.error}>{error}</div>}

        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={styles.button} disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={styles.rowLinks}>
          <Link to="/auth/magic" style={{ color: 'var(--ocn-primary, #2563EB)', fontWeight: 700, textDecoration: 'none' }}>
            Use magic link
          </Link>
          <Link to="/auth/reset/request" style={{ color: 'var(--ocn-primary, #2563EB)', fontWeight: 700, textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <div style={styles.linkRow}>
          <span />
          <span>
            New here?{' '}
            <Link to="/auth/signup" style={{ color: 'var(--ocn-primary, #2563EB)', fontWeight: 700 }}>
              Create an account
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
