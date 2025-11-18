import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

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
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 8,
  },
  success: {
    color: '#065F46',
    background: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 12,
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
};

/**
 * PUBLIC_INTERFACE
 * Signup page for creating accounts via Supabase Auth (email/password).
 */
export default function Signup() {
  const { signUp, isConfigured, configWarning } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!isConfigured) {
      setError('Authentication is not configured for this environment.');
      return;
    }

    try {
      setSubmitting(true);
      const { user, session } = await signUp({ email, password });
      if (!session) {
        setNotice('Signup successful. Please check your email to confirm your account, then sign in.');
      } else if (user) {
        setNotice('Account created and signed in.');
        setTimeout(() => navigate('/', { replace: true }), 800);
      }
    } catch (err) {
      setError(err?.message || 'Failed to sign up. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={onSubmit} aria-labelledby="signup-title">
        <h1 id="signup-title" style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Join the LMS and start learning.</p>

        {!isConfigured && <div role="alert" style={styles.hint}>{configWarning}</div>}
        {error && <div role="alert" style={styles.error}>{error}</div>}
        {notice && <div role="status" style={styles.success}>{notice}</div>}

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
          placeholder="Create a strong password"
          autoComplete="new-password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" style={styles.button} disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign Up'}
        </button>

        <div style={styles.linkRow}>
          <span />
          <span>
            Already have an account?{' '}
            <Link to="/auth/login" style={{ color: 'var(--ocn-primary, #2563EB)', fontWeight: 700 }}>
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
