import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

/**
 * PUBLIC_INTERFACE
 * ResetPassword page: requests a password reset email for provided address.
 * - Uses useAuth.resetPassword which delegates to Supabase
 * - Uses REACT_APP_FRONTEND_URL to build redirect when not provided
 */
export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError('');
    setInfo('');
    try {
      const siteUrl = process?.env?.REACT_APP_FRONTEND_URL;
      const redirectTo = siteUrl ? `${siteUrl}/verify-email` : undefined;

      await resetPassword({ email: email.trim(), redirectTo });
      setInfo('If an account exists for this email, a reset link has been sent.');
    } catch (err) {
      setError(err?.message || 'Unable to send reset email. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 className="text-2xl font-semibold" style={{ marginBottom: 8 }}>
          Reset password
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div
            role="alert"
            className="card"
            style={{
              padding: 12,
              background: 'rgba(239,68,68,0.1)',
              borderColor: 'rgba(239,68,68,0.4)',
              color: 'var(--color-error)',
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}
        {info && (
          <div
            className="card"
            style={{
              padding: 12,
              background: 'rgba(37,99,235,0.08)',
              borderColor: 'rgba(37,99,235,0.3)',
              marginBottom: 12,
            }}
          >
            {info}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); setInfo(''); }}
                required
                placeholder="you@example.com"
                className="topbar-search"
                style={{ borderRadius: 8 }}
              />
            </label>

            <button type="submit" className="btn" disabled={submitting} aria-busy={submitting}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 12 }}>
          <Link to="/login" className="link">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
