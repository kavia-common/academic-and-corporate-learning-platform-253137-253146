import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * VerifyEmail page: landing page after email verification or password recovery.
 * - Displays contextual info based on URL params (e.g., type=signup|recovery).
 * - In real flows, Supabase may handle token in URL; client config detectSessionInUrl=true.
 */
export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Checking your verification status…');

  useEffect(() => {
    const type = params.get('type');
    if (type === 'recovery') {
      setMessage('Password recovery link verified. You may now set a new password in the opened tab/window.');
    } else if (type === 'signup') {
      setMessage('Email verified successfully! You can now sign in with your credentials.');
    } else {
      setMessage('If you followed a verification link, your email should now be verified. You can sign in below.');
    }
  }, [params]);

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 className="text-2xl font-semibold" style={{ marginBottom: 8 }}>
          Verify email
        </h1>
        <p style={{ marginTop: 8, color: 'var(--color-text-muted)' }}>{message}</p>

        <div style={{ marginTop: 16 }}>
          <Link to="/login" className="btn">Go to sign in</Link>
        </div>
      </div>
    </div>
  );
}
