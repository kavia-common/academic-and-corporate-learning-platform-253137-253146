/**
 * Storage service for Supabase with robust validation and error handling.
 * Supports uploads for user avatars, course thumbnails, and assignment submissions.
 */

import { supabase } from './client';
import { safeExec, shapeError } from './utils';

function ensureClient() {
  if (!supabase) {
    return shapeError(new Error('Supabase client not initialized'), 'CONFIG_ERROR', 500);
  }
  return { ok: true };
}

/**
 * Validate a bucket and path for simple safety (no traversal).
 */
function validatePath(bucket, path) {
  if (!bucket || typeof bucket !== 'string') {
    return shapeError(new Error('bucket is required'), 'VALIDATION_ERROR', 400);
  }
  if (!path || typeof path !== 'string') {
    return shapeError(new Error('path is required'), 'VALIDATION_ERROR', 400);
  }
  if (path.startsWith('/') || path.includes('..')) {
    return shapeError(new Error('Invalid path'), 'VALIDATION_ERROR', 400);
  }
  return { ok: true };
}

// PUBLIC_INTERFACE
/**
 * Upload a file to a bucket at a specified path.
 * @param {string} bucket
 * @param {string} path - e.g., "avatars/user-123.png"
 * @param {File|Blob|Uint8Array} file
 * @param {{contentType?: string, upsert?: boolean, cacheControl?: string}} options
 */
export async function uploadFile(bucket, path, file, options = {}) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  const val = validatePath(bucket, path);
  if (!val.ok) return val;

  if (!file) {
    return shapeError(new Error('file is required'), 'VALIDATION_ERROR', 400);
  }

  const { contentType = 'application/octet-stream', upsert = true, cacheControl = '3600' } = options;

  return safeExec(async () => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert, cacheControl });
    return { data, error };
  }, 'STORAGE_UPLOAD_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * Get a public URL for a file. Requires bucket to be public or signed URLs usage.
 * @param {string} bucket
 * @param {string} path
 */
export async function getPublicUrl(bucket, path) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  const val = validatePath(bucket, path);
  if (!val.ok) return val;

  return safeExec(async () => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    // getPublicUrl never returns 'error' but we normalize shape
    return { data, error: null };
  }, 'STORAGE_PUBLIC_URL_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * Create a signed URL valid for the specified number of seconds.
 * Useful if bucket is private.
 * @param {string} bucket
 * @param {string} path
 * @param {number} expiresIn - seconds
 */
export async function createSignedUrl(bucket, path, expiresIn = 3600) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  const val = validatePath(bucket, path);
  if (!val.ok) return val;

  if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
    return shapeError(new Error('expiresIn must be a positive number'), 'VALIDATION_ERROR', 400);
  }

  return safeExec(async () => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    return { data, error };
  }, 'STORAGE_SIGNED_URL_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * Remove files from a bucket.
 * @param {string} bucket
 * @param {string[]} paths
 */
export async function removeFiles(bucket, paths) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  if (!bucket || typeof bucket !== 'string') {
    return shapeError(new Error('bucket is required'), 'VALIDATION_ERROR', 400);
  }
  if (!Array.isArray(paths) || !paths.length) {
    return shapeError(new Error('paths must be a non-empty array'), 'VALIDATION_ERROR', 400);
  }

  return safeExec(async () => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
  }, 'STORAGE_REMOVE_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * List files within a bucket and optional folder path.
 * @param {string} bucket
 * @param {string} folderPath - without starting slash, e.g., 'avatars/'
 * @param {{limit?:number, offset?:number, sortBy?:{column:string, order:'asc'|'desc'}}} options
 */
export async function listFiles(bucket, folderPath = '', options = {}) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  if (!bucket || typeof bucket !== 'string') {
    return shapeError(new Error('bucket is required'), 'VALIDATION_ERROR', 400);
  }
  if (folderPath.startsWith('/') || folderPath.includes('..')) {
    return shapeError(new Error('Invalid folderPath'), 'VALIDATION_ERROR', 400);
  }

  const { limit = 100, offset = 0, sortBy = { column: 'name', order: 'asc' } } = options;

  return safeExec(async () => {
    const { data, error } = await supabase.storage.from(bucket).list(folderPath, {
      limit,
      offset,
      sortBy,
    });
    return { data, error };
  }, 'STORAGE_LIST_FAILED', 400);
}
