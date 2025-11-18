import React, { useState } from 'react';
import useAuthActions from '../../hooks/useAuthActions';

const ui = {
  page: { minHeight: 'calc(100vh - 56px)', display: 'grid', placeItems: 'center', background: 'var(--ocn-bg-canvas, #F5F7FB)', padding: 24 },
  card: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: 'var(--ocn-shadow-1, 0 4px 12px rgba(12,32,80,0.08))', width: '100%', maxWidth: 420, padding: 24 },
  title: { font: '800 22px/28px "Helvetica Neue", Arial, sans-serif', color: '#111827', margin: '0 0 12px' },
  label: { display: 'block', font: '600 13px/18px "Helvetica Neue", Arial, sans-serif', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 12 },
  button: { width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: 'var(--ocn-primary, #2563EB)', color: '#fff', font: '700 14px/20px "Helvetica Neue", Arial, sans-serif', cursor: 'pointer' },
  hint: { color: '#4B5563', fontSize: 13, marginTop: 8 },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 8 },
};

export default function MagicLink() {
  const { signInWithMagicLink } = useAuthActions();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    try {
      setSubmitting(true);
      await signInWithMagicLink(email);
    } catch (e) {
      setError(e?.message || 'Failed to send magic link.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={ui.page}>
      <form style={ui.card} onSubmit={onSubmit}>
        <h1 style={ui.title}>Sign in with a Magic Link</h1>
        {error && <div role="alert" style={ui.error}>{error}</div>}
        <label style={ui.label} htmlFor="email">Email</label>
        <input id="email" type="email" style={ui.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <button type="submit" style={ui.button} disabled={submitting}>
          {submitting ? 'Sending…' : 'Send Magic Link'}
        </button>
        <div style={ui.hint}>We’ll email you a secure link to sign in.</div>
      </form>
    </div>
  );
}
