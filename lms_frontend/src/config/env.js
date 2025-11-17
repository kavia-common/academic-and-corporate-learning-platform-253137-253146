//
// Environment configuration and validation for the LMS frontend
//
// This module validates required environment variables for Supabase and exports
// a typed-safe configuration object for use across the app. It avoids exposing
// sensitive error details to end users while making development-time issues clear
// via console warnings and explicit thrown errors during initialization.
//

/**
 * Get a string environment variable from process.env while ensuring it is defined and non-empty.
 * This function throws during development/test to surface configuration mistakes early.
 *
 * Note: In CRA (react-scripts), only variables prefixed with REACT_APP_ are exposed.
 * This app uses VITE_ naming per acceptance criteria, so these MUST be injected by the
 * runtime/build system. If they are not present, this module will surface a clear error.
 *
 * @param {string} key - The env var name to read.
 * @param {object} options - Options for handling missing values.
 * @param {boolean} options.required - Whether the env var is required.
 * @returns {string|undefined} The environment variable value.
 */
function getEnvString(key, { required = false } = {}) {
  const value =
    typeof process !== 'undefined' &&
    process.env &&
    Object.prototype.hasOwnProperty.call(process.env, key)
      ? process.env[key]
      : undefined;

  if ((value === undefined || value === '') && required) {
    const safeMessage = `Missing required environment variable: ${key}`;
    // During development and test, throw to fail fast. In production, we still throw
    // to ensure the app doesn't start in a broken state.
    // Logging avoids leaking secrets but makes the issue visible in console.
    // eslint-disable-next-line no-console
    console.error(`[ENV] ${safeMessage}`);
    throw new Error(safeMessage);
  }

  return value;
}

/**
 * Build the configuration object with validated values.
 * The Supabase URL and ANON KEY are required for the client to function correctly.
 */
const config = {
  // PUBLIC values used by the frontend - no secrets logged here
  SUPABASE_URL: getEnvString('VITE_SUPABASE_URL', { required: true }),
  SUPABASE_ANON_KEY: getEnvString('VITE_SUPABASE_ANON_KEY', { required: true }),
};

/**
 * Freeze to avoid accidental runtime mutations.
 */
Object.freeze(config);

// PUBLIC_INTERFACE
export function getEnv() {
  /** Returns validated, readonly environment configuration for the app. */
  return config;
}

// PUBLIC_INTERFACE
export function assertEnvReady() {
  /**
   * Asserts that all required environment variables are present.
   * Useful to call early during app bootstrap if desired.
   */
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error(
      'Environment is not correctly configured for Supabase. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
}

export default config;
