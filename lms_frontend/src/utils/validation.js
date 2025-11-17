//
// PUBLIC INTERFACE
// Basic validation and sanitization utilities following simple, safe patterns.
//

const EMAIL_REGEX =
  // Basic RFC 5322–inspired pattern (kept simple for frontend validation)
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/**
 * PUBLIC_INTERFACE
 * Checks if a value is a non-empty trimmed string.
 * @param {any} v - value to validate
 * @returns {boolean}
 */
export function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * PUBLIC_INTERFACE
 * Validates email format (basic client-side check).
 * @param {string} email
 * @returns {boolean}
 */
export function isEmail(email) {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * PUBLIC_INTERFACE
 * Simple sanitization: trims, collapses dangerous characters minimally,
 * and returns a safe-to-display string (basic XSS mitigation; backend must re-validate).
 * @param {string} text
 * @returns {string}
 */
export function isSafeText(text) {
  if (typeof text !== 'string') return '';
  const trimmed = text.trim();

  // Basic escaping of angle brackets and ampersand
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * PUBLIC_INTERFACE
 * Ensures required keys exist and are non-empty in the given object.
 * Throws Error if any key is missing/invalid.
 *
 * @param {Record<string, any>} obj - object to validate
 * @param {string[]} keys - required keys
 */
export function assertRequired(obj, keys) {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid data: expected an object');
  }
  for (const key of keys) {
    const val = obj[key];
    const missing =
      val === undefined ||
      val === null ||
      (typeof val === 'string' && val.trim().length === 0);

    if (missing) {
      throw new Error(`Missing required field: ${key}`);
    }
  }
}
