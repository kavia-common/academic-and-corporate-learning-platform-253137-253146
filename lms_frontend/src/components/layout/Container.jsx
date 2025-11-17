import React, { useCallback, useEffect, useState } from 'react';


/**
 * PUBLIC_INTERFACE
 * Container provides the application shell layout (Sidebar only) and renders children as routed content.
 * - Handles responsive sidebar toggle on mobile
 * - Exposes skip link for accessibility
 */
export default function Container({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeOnEscape = useCallback((e) => {
    if (e.key === 'Escape') setSidebarOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [closeOnEscape]);

  // Layout: single column content area. Sidebar removed per UI cleanup.
  return (
    <div className="app-shell" style={{ background: 'var(--color-background)', color: 'var(--color-text)' }}>
      <a href="#main" className="skip-link">Skip to content</a>
      <main
        id="main"
        className="app-shell__content"
        role="main"
        tabIndex={-1}
        style={{
          padding: 24,
          background: 'var(--color-background)',
          minHeight: '100vh'
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
