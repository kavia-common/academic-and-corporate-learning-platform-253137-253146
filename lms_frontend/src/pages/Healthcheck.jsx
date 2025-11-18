import React, { useEffect, useState } from 'react';
import { getHealthcheckUrl } from '../config/env';
import { apiGet } from '../api/client';

/**
 * PUBLIC_INTERFACE
 * Healthcheck page that pings the backend health endpoint using configured env vars.
 */
export default function Healthcheck() {
  const [status, setStatus] = useState('pending');
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = getHealthcheckUrl();
    // If API_BASE is present apiGet will build absolute URL; otherwise use relative path
    if (url.startsWith('http')) {
      fetch(url)
        .then(async (r) => {
          const t = r.headers.get('content-type') || '';
          const data = t.includes('application/json') ? await r.json() : await r.text();
          if (!r.ok) throw new Error(r.statusText || 'Healthcheck failed');
          setPayload(data);
          setStatus('ok');
        })
        .catch((e) => {
          setError(e.message || 'error');
          setStatus('error');
        });
    } else {
      apiGet(url)
        .then((data) => {
          setPayload(data);
          setStatus('ok');
        })
        .catch((e) => {
          setError(e.message || 'error');
          setStatus('error');
        });
    }
  }, []);

  return (
    <section>
      <h1>Healthcheck</h1>
      <p>Status: <strong>{status}</strong></p>
      {payload && (
        <pre aria-label="healthcheck-response" style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
          {typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)}
        </pre>
      )}
      {error && <p style={{ color: '#EF4444' }}>Error: {error}</p>}
    </section>
  );
}
