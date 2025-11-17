import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from './Sidebar';

/**
 * PUBLIC_INTERFACE
 * Container provides the application shell layout with a global left Sidebar and renders children as routed content.
 * - Handles responsive sidebar toggle on mobile
 * - Exposes skip link for accessibility
 * - Keeps previously removed elements (top-right Home link, secondary nav, right-side strip) absent
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

  // Layout: Sidebar (fixed width) + main content (flex:1).
  return (
    <div
      className="app-shell"
      style={{
        background: 'var(--color-background)',
        color: 'var(--color-text)',
        minHeight: '100vh',
      }}
    >
      <a href="#main" className="skip-link">Skip to content</a>

      <div
        className="app-shell__row"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {/* Left Sidebar (fixed width) */}
        <div
          className="app-shell__sidebar"
          style={{
            width: 256,
            flex: '0 0 256px',
            background: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
          aria-hidden={false}
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        {/* Main content area */}
        <main
          id="main"
          className="app-shell__content"
          role="main"
          tabIndex={-1}
          style={{
            flex: 1,
            minWidth: 0,
            padding: 24,
            background: 'var(--color-background)',
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
