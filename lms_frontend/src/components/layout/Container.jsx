import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from './Sidebar';

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

  // Layout: sidebar on the left, content on the right. Removed TopBar and any reserved top spacing.
  return (
    <div className="app-shell" style={{ background: 'var(--color-background)', color: 'var(--color-text)' }}>
      <a href="#main" className="skip-link">Skip to content</a>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh' }}>
        <aside
          className="app-shell__sidebar"
          data-open={sidebarOpen}
          aria-hidden={!sidebarOpen}
          aria-label="Primary"
          style={{
            borderRight: '1px solid rgba(17,24,39,0.08)',
            background: 'var(--color-surface)'
          }}
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        <main
          id="main"
          className="app-shell__content"
          role="main"
          tabIndex={-1}
          style={{
            padding: 24,
            background: 'var(--color-background)'
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
