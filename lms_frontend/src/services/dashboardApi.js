"use strict";

/**
 * Dashboard API client/service layer.
 *
 * - Resolves base URL from environment variables:
 *   Prefer REACT_APP_API_BASE, fallback to REACT_APP_BACKEND_URL.
 * - Provides typed fetch functions with basic retry and sensible defaults.
 * - Includes credentials for same-origin auth if needed.
 * - Guards missing env with user-friendly messages and console warnings.
 *
 * NOTE: Do not hardcode secrets. All configuration via environment variables.
 */

const DEFAULT_RETRY = 2;
const DEFAULT_RETRY_DELAY_MS = 500;

/**
 * Resolve API base URL from environment with sensible fallback and warnings.
 * Prefers REACT_APP_API_BASE; falls back to REACT_APP_BACKEND_URL.
 * Warns when neither is provided.
 * @returns {string|null} The resolved base URL or null if missing.
 */
function resolveApiBase() {
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    null;

  if (!base) {
    // eslint-disable-next-line no-console
    console.warn(
      "[dashboardApi] Missing API base URL. Set REACT_APP_API_BASE or REACT_APP_BACKEND_URL in environment."
    );
    return null;
  }
  return base.replace(/\/+$/, ""); // trim trailing slash
}

/**
 * Sleep helper for retry backoff.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Core fetch wrapper with JSON handling, retries, and friendly errors.
 * Sends credentials for same-origin cookies; adjust if CORS is configured otherwise.
 *
 * @param {string} path - API path beginning with "/"
 * @param {RequestInit & { retry?: number, retryDelayMs?: number }} [options]
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} with message safe for user-facing surfaces.
 */
async function apiFetch(path, options = {}) {
  const base = resolveApiBase();
  if (!base) {
    throw new Error(
      "Unable to load data: API base URL is not configured. Please contact support."
    );
  }

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const {
    retry = DEFAULT_RETRY,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    headers,
    ...rest
  } = options;

  const reqInit = {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    ...rest,
  };

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const resp = await fetch(url, reqInit);

      if (!resp.ok) {
        // Try to parse error body if present
        let errBody;
        try {
          errBody = await resp.json();
        } catch {
          // ignore parse errors
        }
        const message =
          (errBody && (errBody.message || errBody.error)) ||
          `Request failed with status ${resp.status}`;
        const error = new Error(message);
        error.status = resp.status;
        error.details = errBody || null;
        throw error;
      }

      // Attempt JSON parse; allow empty body
      const text = await resp.text();
      const data = text ? JSON.parse(text) : null;
      return data;
    } catch (err) {
      attempt += 1;
      const isLast = attempt > retry;
      const retriable =
        // Network errors or 5xx considered retriable
        !err.status || (err.status >= 500 && err.status < 600);

      if (!retriable || isLast) {
        // eslint-disable-next-line no-console
        console.error("[dashboardApi] fetch error:", {
          url,
          attempt,
          error: err && err.message,
          status: err && err.status,
        });
        // Provide user-friendly message
        throw new Error(
          err && err.message
            ? err.message
            : "An unexpected error occurred while contacting the server."
        );
      }

      await sleep(retryDelayMs * attempt); // simple linear backoff
    }
  }
}

/**
 * PUBLIC_INTERFACE
 * Get summary stats for stat cards.
 * @returns {Promise<{ courses: number, learners: number, completionRate: number, activeSessions: number }>}
 */
export async function getDashboardSummary() {
  return apiFetch("/api/dashboard/summary");
}

/**
 * PUBLIC_INTERFACE
 * Get progress breakdown for donut chart.
 * @returns {Promise<{ completed: number, inProgress: number, notStarted: number }>}
 */
export async function getDashboardProgress() {
  return apiFetch("/api/dashboard/progress");
}

/**
 * PUBLIC_INTERFACE
 * Get recent activity checklist items.
 * @returns {Promise<Array<{ id: string|number, title: string, timestamp: string, completed?: boolean }>>}
 */
export async function getDashboardActivity() {
  return apiFetch("/api/dashboard/activity");
}

/**
 * PUBLIC_INTERFACE
 * Get trend data for sparkline.
 * @returns {Promise<{ series: Array<number>, labels?: Array<string> }>}
 */
export async function getDashboardTrends() {
  return apiFetch("/api/dashboard/trends");
}

/**
 * PUBLIC_INTERFACE
 * Utility to expose resolved API base (for diagnostics).
 * @returns {string|null} The base URL or null if not configured.
 */
export function getResolvedApiBase() {
  return resolveApiBase();
}
