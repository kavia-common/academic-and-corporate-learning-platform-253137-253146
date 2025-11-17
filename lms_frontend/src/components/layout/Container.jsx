import React, { useCallback, useEffect, useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

/**
 * PUBLIC_INTERFACE
 * Container provides the application shell layout (TopBar + Sidebar) and renders children as routed content.
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

  return (
    <div className="app-shell" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <a href="#main" className="skip-link">Skip to content</a>

      <aside
        className="app-shell__sidebar"
        data-open={sidebarOpen}
        aria-hidden={!sidebarOpen}
        aria-label="Primary"
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <header className="app-shell__topbar" role="banner">
        <TopBar onMenuToggle={() => setSidebarOpen(v => !v)} />
      </header>

      <main id="main" className="app-shell__content" role="main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
