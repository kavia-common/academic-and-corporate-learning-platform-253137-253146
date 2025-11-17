import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../AuthProvider';
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getAvatarPublicUrl,
  getAvatarSignedUrl,
  saveProfileAvatarPath,
  validateAvatarFile,
} from '../../supabase/supabaseStorage';

/**
 * PUBLIC_INTERFACE
 * Profile page for the current user.
 * - Shows current profile info and avatar (if present)
 * - Allows uploading a new avatar with validation (png/jpg/webp <= 5MB)
 * - Stores the uploaded file in Supabase Storage 'avatars' bucket
 * - Persists the storage path in profiles table
 * - Displays avatar using a signed URL (fallback to public URL)
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
    let mounted = true;
    if (!isAuthed || !userId) return;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMyProfile(userId);
        if (!mounted) return;
        setProfile((p) => ({
          ...p,
          full_name: data?.full_name || '',
          username: data?.username || '',
          website: data?.website || '',
          avatar_path: data?.avatar_path || null,
          avatar_url: data?.avatar_url || null,
        }));
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthed, userId]);

  useEffect(() => {
    let cancelled = false;
    async function hydrateUrl() {
      setAvatarDisplayUrl(null);
      const path = profile?.avatar_path || profile?.avatar_url;
      if (!path) return;

      // Try signed first (works for private buckets). If fails, try public.
      const signed = await getAvatarSignedUrl(path).catch(() => null);
      if (cancelled) return;
      if (signed) {
        setAvatarDisplayUrl(signed);
        return;
      }
      const pub = await getAvatarPublicUrl(path);
      if (cancelled) return;
      setAvatarDisplayUrl(pub);
    }
    hydrateUrl();
    return () => {
      cancelled = true;
    };
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
    setInfo('');
    try {
      const updated = await updateMyProfile(userId, {
        full_name: profile.full_name,
        username: profile.username,
        website: profile.website,
      });
      setProfile((p) => ({ ...p, ...updated }));
      setInfo('Profile saved.');
    } catch (err) {
      setError(err?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setInfo('');

    try {
      validateAvatarFile(file);
    } catch (ve) {
      setError(ve.message);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setAvatarLoading(true);
      const path = await uploadAvatar(file, userId);
      await saveProfileAvatarPath(userId, path);
      setProfile((p) => ({ ...p, avatar_path: path, avatar_url: null }));
      setInfo('Avatar updated.');
      // after updating path, signed URL hook effect will refresh avatarDisplayUrl
    } catch (err) {
      setError(err?.message || 'Failed to upload avatar.');
      // clear preview if failed
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
    }
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
                  // local preview
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
                <label className="btn" style={{ cursor: 'pointer', width: 'fit-content' }}>
                  {avatarLoading ? 'Uploading…' : 'Upload avatar'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onAvatarChange}
                    style={{ display: 'none' }}
                    aria-label="Upload avatar"
                    disabled={avatarLoading}
                  />
                </label>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Accepted types: PNG, JPG, WEBP. Max size: 5MB.
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
