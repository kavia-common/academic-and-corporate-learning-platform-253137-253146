//
// PUBLIC INTERFACE
// Error helpers for mapping Supabase errors into user-friendly messages,
// and a safeExec helper for consistent async call handling.
//

/**
 * PUBLIC_INTERFACE
 * Map Supabase error codes to user-friendly messages.
 * Extend this map as more codes are encountered.
 *
 * @param {string|undefined|null} code - Supabase error code, if present
 * @returns {string} Friendly message for end users
 */
export function mapSupabaseError(code) {
  const defaultMsg = 'Something went wrong. Please try again.';
  if (!code) return defaultMsg;

  const codeMap = {
    // Auth-related
    'invalid_credentials': 'Incorrect email or password.',
    'email_not_confirmed': 'Please verify your email address to continue.',
    'user_already_exists': 'An account with this email already exists.',
    'rate_limit_exceeded': 'Too many attempts. Please try again later.',
    'oauth_callback_error': 'Authentication failed via provider. Please try again.',
    'session_not_found': 'Your session has expired. Please sign in again.',

    // General database or API errors
    'bad_request': 'Invalid request. Please check your input.',
    'forbidden': 'You are not allowed to perform this action.',
    'not_found': 'Requested resource was not found.',
    'conflict': 'The action could not be completed due to a conflict.',
    'payload_too_large': 'The uploaded file is too large.',
    'unsupported_media_type': 'Unsupported file type.',
    'service_unavailable': 'Service is temporarily unavailable. Please try again later.',
  };

  // Match case-insensitively
  const normalized = String(code).toLowerCase();
  return codeMap[normalized] || defaultMsg;
}

/**
 * PUBLIC_INTERFACE
 * Execute an async function and normalize its result into { data, error }.
 * If the function throws, it is captured and mapped to a friendly error.
 *
 * @template T
 * @param {() => Promise<T>} asyncFn - function to execute
 * @param {(err:any) => string} [errorMapper] - optional mapper to convert error into message
 * @returns {Promise<{data: T|null, error: string|null}>}
 */
export async function safeExec(asyncFn, errorMapper) {
  try {
    const data = await asyncFn();
    return { data, error: null };
  } catch (err) {
    // Supabase errors can appear as { code, message }
    const code = err?.code || err?.status || err?.name;
    const fallback = err?.message || 'Unexpected error';
    const message = errorMapper
      ? errorMapper(err)
      : mapSupabaseError(code) || fallback;

    return { data: null, error: message };
  }
}
