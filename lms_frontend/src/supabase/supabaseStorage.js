import supabase from './client';

/**
 * Utilities for handling avatar uploads and URL retrieval via Supabase Storage.
 * Bucket assumed: 'avatars'
 * Table assumed: 'profiles' with columns: id (uuid PK, equals auth user id), avatar_url (text) or avatar_path (text)
 * We will store the storage path in 'avatar_path' if available, else fallback to 'avatar_url'
 */

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET = 'avatars';

// PUBLIC_INTERFACE
export function validateAvatarFile(file) {
  /** Validate file type and size for avatar uploads. Throws an Error on invalid input. */
  if (!file) throw new Error('Please choose a file.');
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }
  return true;
}

// PUBLIC_INTERFACE
export async function uploadAvatar(file, userId) {
  /**
   * Upload a validated avatar file to Supabase Storage under avatars/<userId>/<timestamp>.<ext>
   * Returns the uploaded storage path string.
   */
  if (!userId) throw new Error('Not signed in.');
  validateAvatarFile(file);

  const ext = (() => {
    const m = file.name?.split('.') || [];
    const e = m.length > 1 ? m[m.length - 1].toLowerCase() : '';
    if (e) return e;
    // best-effort from MIME
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/jpeg') return 'jpg';
    if (file.type === 'image/webp') return 'webp';
    return 'dat';
  })();

  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

  if (error) {
    throw new Error('Failed to upload avatar. Please try again.');
  }

  return path;
}

// PUBLIC_INTERFACE
export async function getAvatarPublicUrl(path) {
  /** Returns a public URL for an object path if bucket/object is public; otherwise returns null. */
  if (!path) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || null;
}

// PUBLIC_INTERFACE
export async function getAvatarSignedUrl(path, { expiresIn = 60 * 60 } = {}) {
  /**
   * Returns a signed URL for a private object path.
   * Default expiry: 1 hour.
   */
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) {
    return null;
  }
  return data?.signedUrl || null;
}

// PUBLIC_INTERFACE
export async function saveProfileAvatarPath(userId, path) {
  /**
   * Upsert the avatar storage path into profiles table.
   * Prefers 'avatar_path' column if exists; falls back to 'avatar_url'.
   */
  if (!userId) throw new Error('Not signed in.');

  // Try avatar_path first
  let payload = { id: userId, avatar_path: path || null };
  let { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });

  if (error) {
    // If avatar_path column doesn't exist, fallback to avatar_url
    payload = { id: userId, avatar_url: path || null };
    const res2 = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (res2.error) {
      throw new Error('Failed to update profile avatar.');
    }
  }
  return true;
}

// PUBLIC_INTERFACE
export async function getMyProfile(userId) {
  /** Fetch profiles row for current user; returns {} if missing. */
  if (!userId) throw new Error('Not signed in.');
  // Try to select possible columns
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, website, avatar_path, avatar_url, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error('Failed to load profile.');
  }
  return data || {};
}

// PUBLIC_INTERFACE
export async function updateMyProfile(userId, updates) {
  /** Update editable profile fields. Does not allow updating id. */
  if (!userId) throw new Error('Not signed in.');
  const allowed = {};
  if (typeof updates?.full_name === 'string') allowed.full_name = updates.full_name.trim();
  if (typeof updates?.username === 'string') allowed.username = updates.username.trim();
  if (typeof updates?.website === 'string') allowed.website = updates.website.trim();

  const { data, error } = await supabase
    .from('profiles')
    .update(allowed)
    .eq('id', userId)
    .select('id, full_name, username, website, avatar_path, avatar_url, updated_at')
    .maybeSingle();

  if (error) {
    throw new Error('Failed to update profile.');
  }
  return data;
}

export default {
  uploadAvatar,
  getAvatarPublicUrl,
  getAvatarSignedUrl,
  saveProfileAvatarPath,
  getMyProfile,
  updateMyProfile,
  validateAvatarFile,
};
