import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

/**
 * PUBLIC_INTERFACE
 * SignIn page: email/password authentication using Supabase via useAuth.
 * - Validates basic inputs
 * - Shows loading and friendly errors
 * - Redirects to intended "from" route or /dashboard on success
 */
export default function SignIn() {
  const { signIn, status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
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
    try {
      await signIn({ email: form.email.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = submitting || status === 'loading' || status === 'idle';

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 className="text-2xl font-semibold" style={{ marginBottom: 8 }}>
          Sign in
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Welcome back. Enter your credentials to access your account.
        </p>

        {location.state?.notice && (
          <div
            className="card"
            style={{
              padding: 12,
              background: 'rgba(37,99,235,0.08)',
              borderColor: 'rgba(37,99,235,0.3)',
              marginBottom: 12,
            }}
          >
            {location.state.notice}
          </div>
        )}

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

        <form onSubmit={onSubmit} noValidate>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
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
                value={form.password}
                onChange={onChange}
                required
                placeholder="••••••••"
                className="topbar-search"
                style={{ borderRadius: 8 }}
              />
            </label>

            <button
              type="submit"
              className="btn"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <Link to="/reset-password" className="link">
            Forgot password?
          </Link>
          <span style={{ color: 'var(--color-text-muted)' }}>
            No account?{' '}
            <Link to="/signup" className="link">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
