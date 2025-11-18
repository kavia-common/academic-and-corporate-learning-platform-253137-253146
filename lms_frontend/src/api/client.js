//
// Centralized API client for the LMS frontend.
// Uses environment variables for base URLs and provides simple helpers.
//

import { getEnv } from '../config/env';

const { API_BASE, LOG_LEVEL } = getEnv();

function logDebug(...args) {
  if (LOG_LEVEL && ['debug', 'trace'].includes(LOG_LEVEL)) {
    // eslint-disable-next-line no-console
    console.debug('[api]', ...args);
  }
}

// PUBLIC_INTERFACE
export async function apiGet(path, options = {}) {
  /** Performs a GET request to the backend using the configured API_BASE. */
  const url = buildUrl(path);
  logDebug('GET', url);
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, options = {}) {
  /** Performs a POST request to the backend using the configured API_BASE. */
  const url = buildUrl(path);
  logDebug('POST', url, body);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
    ...options,
  });
  return handleResponse(res);
}

function buildUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return p; // Fall back to relative when API_BASE not provided
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  return `${base}${p}`;
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  try {
    data = contentType.includes('application/json') ? await res.json() : await res.text();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message = (data && data.message) || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}
