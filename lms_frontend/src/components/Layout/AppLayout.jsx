import React from 'react';
import { NavLink } from 'react-router-dom';
import './AppLayout.css';

/**
 * PUBLIC_INTERFACE
 * AppLayout provides the base application shell with a top app bar, sidebar, and main content.
 * Children are rendered in the main area.
 */
export default function AppLayout({ children }) {
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
