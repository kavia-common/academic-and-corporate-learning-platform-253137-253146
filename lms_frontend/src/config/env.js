//
// Environment and configuration utilities for the LMS frontend.
// Reads from environment variables and provides safe defaults.
// No secrets are hardcoded. All configuration is read-only exports.
//

let _warnedSupabasePrefix = false;

// PUBLIC_INTERFACE
export function getEnv() {
  /** Returns normalized environment configuration (string values only). */
  const NODE_ENV = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || 'development';
  const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';
  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || '';
  const WS_URL = process.env.REACT_APP_WS_URL || '';
  const HEALTHCHECK_PATH = process.env.REACT_APP_HEALTHCHECK_PATH || '/healthz';
  const FEATURE_FLAGS_RAW = process.env.REACT_APP_FEATURE_FLAGS || '';
  const EXPERIMENTS_ENABLED = process.env.REACT_APP_EXPERIMENTS_ENABLED === 'true' ? 'true' : 'false';

  // Prefer React-prefixed vars, but fall back to unprefixed if present
  let SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
  let SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || '';
  if ((!SUPABASE_URL || !SUPABASE_KEY) && (process.env.SUPABASE_URL || process.env.SUPABASE_KEY)) {
    SUPABASE_URL = SUPABASE_URL || process.env.SUPABASE_URL || '';
    SUPABASE_KEY = SUPABASE_KEY || process.env.SUPABASE_KEY || '';
    if (!_warnedSupabasePrefix && NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn(
        '[env] Using SUPABASE_URL/SUPABASE_KEY as a fallback. Prefer REACT_APP_SUPABASE_URL/REACT_APP_SUPABASE_KEY for React builds.'
      );
      _warnedSupabasePrefix = true;
    }
  }

  const PORT = process.env.REACT_APP_PORT || '';
  const TRUST_PROXY = process.env.REACT_APP_TRUST_PROXY || '';
  const LOG_LEVEL = process.env.REACT_APP_LOG_LEVEL || 'info';
  const ENABLE_SOURCE_MAPS = process.env.REACT_APP_ENABLE_SOURCE_MAPS || 'true';

  return {
    NODE_ENV,
    API_BASE,
    FRONTEND_URL,
    WS_URL,
    HEALTHCHECK_PATH,
    FEATURE_FLAGS_RAW,
    EXPERIMENTS_ENABLED,
    SUPABASE_URL,
    SUPABASE_KEY,
    PORT,
    TRUST_PROXY,
    LOG_LEVEL,
    ENABLE_SOURCE_MAPS,
  };
}

// PUBLIC_INTERFACE
export function getFeatureFlags() {
  /**
   * Parses REACT_APP_FEATURE_FLAGS into an object map.
   * Supports CSV of keys or JSON string of {flag: boolean}.
   * Unknown formats result in an empty object.
   */
  const raw = process.env.REACT_APP_FEATURE_FLAGS || '';
  if (!raw) return {};
  try {
    // Try JSON first
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // Fallback to CSV of "flag1,flag2"
    const flags = {};
    raw
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
      .forEach((k) => (flags[k] = true));
    return flags;
  }
  return {};
}

// PUBLIC_INTERFACE
export function getHealthcheckUrl() {
  /** Compose a full healthcheck URL using API_BASE and HEALTHCHECK_PATH */
  const { API_BASE } = getEnv();
  const path = process.env.REACT_APP_HEALTHCHECK_PATH || '/healthz';
  if (!API_BASE) return path;
  // Ensure single slash
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
