import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

// PUBLIC_INTERFACE
export const ToastContext = createContext({
  /** Show a toast message with type: 'info' | 'success' | 'error' */
  showToast: (_message, _type = 'info', _opts = {}) => {},
});

/**
 * PUBLIC_INTERFACE
 * ToastProvider renders a global toast container and exposes showToast via context.
 * Ocean Professional styling with subtle shadows and rounded corners.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', opts = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const ttl = typeof opts.ttl === 'number' ? opts.ttl : 4000;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (ttl > 0) {
      setTimeout(() => removeToast(id), ttl);
    }
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  useEffect(() => {
    // Esc to clear all
    const onKey = (e) => {
      if (e.key === 'Escape') setToasts([]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const containerStyle = {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 9999,
    display: 'grid',
    gap: 8,
  };

  const baseStyle = {
    minWidth: 260,
    maxWidth: 420,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderLeftWidth: 6,
    borderRadius: 10,
    padding: '10px 12px',
    boxShadow: 'var(--ocn-shadow-1, 0 4px 12px rgba(12,32,80,0.08))',
    font: '600 13px/18px "Helvetica Neue", Arial, sans-serif',
    color: '#111827',
  };

  const typeBorders = {
    info: '#2563EB',
    success: '#16A34A',
    error: '#DC2626',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={containerStyle}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{ ...baseStyle, borderLeftColor: typeBorders[t.type] || typeBorders.info }}
            onClick={() => removeToast(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  /** Access the toast showToast(message, type, opts) */
  return useContext(ToastContext);
}
