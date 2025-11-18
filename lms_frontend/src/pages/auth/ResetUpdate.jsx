import React, { useEffect, useState } from 'react';
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
  success: { color: '#065F46', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 12 },
};

export default function ResetUpdate() {
  const { updatePasswordFromToken } = useAuthActions();
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Optional: surface when access_token present to guide users
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setNotice('Recovery link verified. Set a new password below.');
    }
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!pwd || pwd.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (pwd !== pwd2) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setSubmitting(true);
      await updatePasswordFromToken(pwd);
      setNotice('Password updated. You can now continue using the app.');
    } catch (e) {
      setError(e?.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={ui.page}>
      <form style={ui.card} onSubmit={onSubmit}>
        <h1 style={ui.title}>Set a new password</h1>
        {notice && <div role="status" style={ui.success}>{notice}</div>}
        {error && <div role="alert" style={ui.error}>{error}</div>}
        <label style={ui.label} htmlFor="pwd">New password</label>
        <input id="pwd" type="password" style={ui.input} value={pwd} onChange={(e) => setPwd(e.target.value)} minLength={6} placeholder="••••••••" />
        <label style={ui.label} htmlFor="pwd2">Confirm new password</label>
        <input id="pwd2" type="password" style={ui.input} value={pwd2} onChange={(e) => setPwd2(e.target.value)} minLength={6} placeholder="••••••••" />
        <button type="submit" style={ui.button} disabled={submitting}>
          {submitting ? 'Updating…' : 'Update Password'}
        </button>
        <div style={ui.hint}>This form is used when you arrive via the recovery link from your email.</div>
      </form>
    </div>
  );
}
