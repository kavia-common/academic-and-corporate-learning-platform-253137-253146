import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../AuthProvider';

/**
 * PUBLIC_INTERFACE
 * Profile page (simplified placeholder).
 * - Displays basic editable fields locally
 * - Avatar upload is disabled until storage/profile helpers are wired
 */
export default function ProfilePage() {
  const { status, user } = useAuth();
  const isAuthed = status === 'authenticated';
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    website: '',
    avatar_path: null,
    avatar_url: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarDisplayUrl, setAvatarDisplayUrl] = useState(null);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const hasAvatarPath = useMemo(() => !!(profile?.avatar_path || profile?.avatar_url), [profile]);

  useEffect(() => {
    // Placeholder: initialize with basic user data if available
    setLoading(false);
  }, [isAuthed, userId]);

  useEffect(() => {
    // No avatar hydration without storage helpers; keep placeholder icon
    setAvatarDisplayUrl(null);
  }, [profile?.avatar_path, profile?.avatar_url]);

  if (!isAuthed) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          You must be signed in to view your profile.
        </div>
      </div>
    );
  }

  const onFieldChange = (e) => {
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
    setInfo('');
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setInfo('Profile saved (local only placeholder).');
    setTimeout(() => setSaving(false), 300);
  };

  const onAvatarChange = async () => {
    setError('Avatar upload is not configured yet.');
    setInfo('');
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="card" style={{ padding: 16, display: 'grid', gap: 16 }}>
        <h1 className="text-2xl font-semibold" style={{ margin: 0 }}>My Profile</h1>

        {loading ? (
          <div>Loading profile…</div>
        ) : (
          <>
            {error && (
              <div
                role="alert"
                className="card"
                style={{
                  padding: 10,
                  background: 'rgba(239,68,68,0.1)',
                  borderColor: 'rgba(239,68,68,0.4)',
                  color: 'var(--color-error)',
                }}
              >
                {error}
              </div>
            )}
            {info && (
              <div
                className="card"
                style={{
                  padding: 10,
                  background: 'rgba(37,99,235,0.08)',
                  borderColor: 'rgba(37,99,235,0.3)',
                }}
              >
                {info}
              </div>
            )}

            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: 'var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-bg)',
                }}
                aria-label="Profile avatar"
              >
                {avatarPreview ? (
                  <img
                    alt="New avatar preview"
                    src={avatarPreview}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : hasAvatarPath && avatarDisplayUrl ? (
                  <img
                    alt="Current avatar"
                    src={avatarDisplayUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span aria-hidden="true" style={{ color: 'var(--color-text-muted)' }}>👤</span>
                )}
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <label className="btn" style={{ cursor: 'not-allowed', width: 'fit-content', opacity: 0.7 }}>
                  Upload avatar (disabled)
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onAvatarChange}
                    style={{ display: 'none' }}
                    aria-label="Upload avatar"
                    disabled
                  />
                </label>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Avatar upload will be enabled when storage/profile helpers are configured.
                </small>
              </div>
            </div>

            <form onSubmit={onSave} noValidate style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Full name</span>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={onFieldChange}
                  className="topbar-search"
                  style={{ borderRadius: 8 }}
                  placeholder="Your name"
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Username</span>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={onFieldChange}
                  className="topbar-search"
                  style={{ borderRadius: 8 }}
                  placeholder="Preferred handle"
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span>Website</span>
                <input
                  type="url"
                  name="website"
                  value={profile.website}
                  onChange={onFieldChange}
                  className="topbar-search"
                  style={{ borderRadius: 8 }}
                  placeholder="https://example.com"
                />
              </label>

              <button type="submit" className="btn" disabled={saving} aria-busy={saving}>
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
