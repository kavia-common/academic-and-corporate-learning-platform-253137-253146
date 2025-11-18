import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './AppLayout.css';
import { useAuth } from '../../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * AppLayout provides the base application shell with a top app bar, sidebar, and main content.
 * Children are rendered in the main area.
 */
export default function AppLayout({ children }) {
  const { user, signOut, isConfigured } = useAuth();

  async function onLogout() {
    try {
      await signOut();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Logout failed', e?.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar" role="banner" aria-label="Top application bar">
        <div className="topbar__brand">
          <div className="brand__logo" aria-hidden="true">🎓</div>
          <div className="brand__text">
            <span className="brand__title">LMS</span>
            <span className="brand__subtitle">Ocean Professional</span>
          </div>
        </div>
        <div className="topbar__spacer" />
        <nav className="topbar__nav" aria-label="Top navigation">
          <NavLink to="/" className="topbar__link">Dashboard</NavLink>
          {/* Auth menu on the right */}
          <span style={{ marginLeft: 16 }} />
          {isConfigured ? (
            user ? (
              <div aria-label="User menu" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#4B5563', fontSize: 14 }}>{user.email}</span>
                <button
                  onClick={onLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid #E5E7EB',
                    color: '#111827',
                    padding: '6px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div aria-label="Auth links" style={{ display: 'inline-flex', gap: 12 }}>
                <Link to="/auth/login" className="topbar__link">Login</Link>
                <Link to="/auth/signup" className="topbar__link">Sign up</Link>
              </div>
            )
          ) : null}
        </nav>
      </header>

      <div className="app-body">
        <aside className="sidebar" aria-label="Sidebar navigation">
          <nav className="sidebar__nav">
            <NavLink to="/courses" className={({ isActive }) => 'sidebar__link' + (isActive ? ' is-active' : '')}>
              Courses
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => 'sidebar__link' + (isActive ? ' is-active' : '')}>
              Users
            </NavLink>
            <NavLink to="/assignments" className={({ isActive }) => 'sidebar__link' + (isActive ? ' is-active' : '')}>
              Assignments
            </NavLink>
            <NavLink to="/progress" className={({ isActive }) => 'sidebar__link' + (isActive ? ' is-active' : '')}>
              Progress
            </NavLink>
            <NavLink to="/health" className={({ isActive }) => 'sidebar__link' + (isActive ? ' is-active' : '')}>
              Healthcheck
            </NavLink>
          </nav>
        </aside>
        <main className="main" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
