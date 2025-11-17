import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

/**
 * PUBLIC_INTERFACE
 * SignUp page: email/password registration via Supabase.
 * - Includes optional role selection (defaults to student)
 * - Sends email confirmation when applicable
 * - Shows friendly success and error messages
 */
export default function SignUp() {
  const { signUp, status } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setInfo('');
  };

  const validate = () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.');
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
      const emailRedirectTo = siteUrl ? `${siteUrl}/verify-email` : undefined;

      await signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo,
          data: { role: form.role || 'student' },
        },
      });

      setInfo(
        'If email confirmation is required, we sent you a verification link. Please check your inbox.'
      );
    } catch (err) {
      setError(err?.message || 'Unable to sign up. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || status === 'loading' || status === 'idle';

  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 className="text-2xl font-semibold" style={{ marginBottom: 8 }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Join the platform to access courses and track your progress.
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
                required
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className="topbar-search"
                style={{ borderRadius: 8 }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Password</span>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="topbar-search"
                style={{ borderRadius: 8 }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span>Role</span>
              <select
                name="role"
                value={form.role}
                onChange={onChange}
                className="topbar-search"
                style={{ borderRadius: 8 }}
              >
                <option value="student">Student (default)</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button type="submit" className="btn" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? 'Creating account…' : 'Sign up'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 12 }}>
          <span style={{ color: 'var(--color-text-muted)' }}>
            Already have an account? <Link to="/login" className="link">Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
