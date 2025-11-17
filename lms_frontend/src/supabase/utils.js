//
// Shared utilities for Supabase service modules: validation, error shaping, and safe execution wrappers.
//

/**
 * Shape an error consistently for UI consumption, without leaking sensitive details.
 * @param {Error|any} err - The error object thrown from Supabase SDK or runtime
 * @param {string} code - Stable application error code
 * @param {number} status - HTTP-like status code for UI logic (e.g., 400/401/403/404/409/500)
 * @param {object} extra - Optional extra context (non-sensitive)
 * @returns {{ok: false, error: {message: string, code: string, status: number, details?: any}}}
 */
export function shapeError(err, code = 'INTERNAL_ERROR', status = 500, extra = {}) {
  const safeMessage =
    (err && (err.message || err.error_description || err.msg)) ||
    'Unexpected error occurred';
  const shaped = {
    ok: false,
    error: {
      message: safeMessage,
      code,
      status,
      ...(extra && Object.keys(extra).length ? { details: extra } : {}),
    },
  };
  return shaped;
}

/**
 * Wraps an async operation to normalize Supabase response into a { ok, data, error } shape.
 * Ensures errors are returned in a consistent manner and never throw to callers.
 * @param {Function} fn - async function performing SDK calls
 * @param {string} code - application error code
 * @param {number} status - http-like status
 * @returns {Promise<{ok: true, data: any} | {ok: false, error: {message: string, code: string, status: number, details?: any}}>}
 */
export async function safeExec(fn, code = 'OPERATION_FAILED', status = 500) {
  try {
    const result = await fn();
    if (!result) {
      return shapeError(new Error('Empty result'), code, status);
    }
    if (result.error) {
      return shapeError(result.error, code, status, { supabase: true });
    }
    return { ok: true, data: result.data ?? result };
  } catch (err) {
    return shapeError(err, code, status);
  }
}

/**
 * Basic object schema validation. Only checks presence and primitive type for keys.
 * Avoids adding extra deps; suitable for frontend basic validation.
 * @param {object} schema - { fieldName: 'string' | 'number' | 'boolean' | 'object' | 'array' }
 * @param {object} payload - object to validate
 * @returns {{ok: true} | {ok: false, error: { message: string, code: string, status: number, details: any}}}
 */
export function validatePayload(schema, payload) {
  if (!schema || typeof schema !== 'object') {
    return shapeError(new Error('Invalid schema'), 'VALIDATION_ERROR', 400);
  }
  if (payload == null || typeof payload !== 'object') {
    return shapeError(new Error('Payload must be an object'), 'VALIDATION_ERROR', 400);
  }
  const issues = [];
  for (const [key, expected] of Object.entries(schema)) {
    const value = payload[key];
    if (value === undefined || value === null) {
      issues.push(`${key} is required`);
      continue;
    }
    const type = Array.isArray(value) ? 'array' : typeof value;
    if (expected !== 'any' && type !== expected) {
      issues.push(`${key} must be of type ${expected}, got ${type}`);
    }
  }
  if (issues.length) {
    return shapeError(new Error('Validation failed'), 'VALIDATION_ERROR', 400, { issues });
  }
  return { ok: true };
}

/**
 * Utility to build common pagination parameters for range queries.
 * @param {number} page - 1-based page index
 * @param {number} pageSize - number of items per page
 * @returns {{from: number, to: number}}
 */
export function buildRange(page = 1, pageSize = 20) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
  const from = (safePage - 1) * safeSize;
  const to = from + safeSize - 1;
  return { from, to };
}
