import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { Card, CardBody, CardHeader, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back. Enter your credentials to access your account.
          </p>
        </CardHeader>
        <CardBody>
          {location.state?.notice && (
            <div
              className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 mb-3"
              role="status"
            >
              {location.state.notice}
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-3"
            >
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-3" noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardBody>
        <CardFooter className="flex items-center justify-between">
          <Link to="/reset-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
          <span className="text-sm text-gray-600">
            No account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
