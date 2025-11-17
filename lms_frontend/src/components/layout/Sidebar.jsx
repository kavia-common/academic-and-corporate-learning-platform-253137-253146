import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * Sidebar renders the primary navigation.
 *
 * Props:
 * - onNavigate: function - called after a nav link is clicked (useful for closing mobile drawer)
 */
export default function Sidebar({ onNavigate }) {
  const { status, role } = useAuth();
  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  // Helper to apply active styles consistently
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
    }`;

  return (
    <nav aria-label="Primary Navigation" style={{ padding: 12, background: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Keep brand header separate from nav items to avoid appearing as a clickable top link */}
      <div className="card" style={{ padding: 12, marginBottom: 12, background: 'var(--color-surface)' }} aria-label="Brand">
        <div style={{ background: 'var(--gradient-soft)', borderRadius: 'var(--radius-md)', padding: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Ocean Professional</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>Clean, modern LMS UI</div>
        </div>
      </div>

      <ul className="nav" role="list" style={{ display: 'grid', gap: 6 }}>
        {/* Top group: only Dashboard. Admin must NOT appear here. */}
        {isAuthed && (
          <li>
            <NavLink to="/dashboard" onClick={onNavigate} className={linkClass} end>
              <span aria-hidden>📊</span>
              <span>Dashboard</span>
            </NavLink>
          </li>
        )}

        {/* Remaining navigation (ordered): Courses, Quizzes, role-specific ... */}
        <li>
          <NavLink to="/courses" onClick={onNavigate} className={linkClass}>
            <span aria-hidden>🎓</span>
            <span>Courses</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/quizzes" onClick={onNavigate} className={linkClass}>
            <span aria-hidden>❓</span>
            <span>Quizzes</span>
          </NavLink>
        </li>

        {isAuthed && r === 'student' && (
          <li>
            <NavLink to="/assignments" onClick={onNavigate} className={linkClass}>
              <span aria-hidden>📝</span>
              <span>My Assignments</span>
            </NavLink>
          </li>
        )}

        {isAuthed && r === 'instructor' && (
          <>
            <li>
              <NavLink to="/instructor" onClick={onNavigate} className={linkClass}>
                <span aria-hidden>📚</span>
                <span>Instructor</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/assignments" onClick={onNavigate} className={linkClass}>
                <span aria-hidden>📝</span>
                <span>Assignments</span>
              </NavLink>
            </li>
          </>
        )}

        {isAuthed ? (
          <>
            <li>
              <NavLink to="/profile" onClick={onNavigate} className={linkClass}>
                <span aria-hidden>👤</span>
                <span>Profile</span>
              </NavLink>
            </li>
            {/*
              PUBLIC_INTERFACE
              Admin navigation item - visible only to admin role.

              LOCKED PLACEMENT: Do not move, duplicate, or conditionally re-insert this item elsewhere.
              It must remain immediately AFTER the Profile item. If Profile is conditionally hidden,
              this Admin item should also remain in this block so it naturally follows Profile when present.

              Active state is handled by NavLink via linkClass.
            */}
            {r === 'admin' && (
              <li>
                <NavLink to="/admin" onClick={onNavigate} className={linkClass} end>
                  <span aria-hidden>🛠️</span>
                  <span>Admin</span>
                </NavLink>
              </li>
            )}
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login" onClick={onNavigate} className={linkClass}>
                <span aria-hidden>🔐</span>
                <span>Sign in</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/signup" onClick={onNavigate} className={linkClass}>
                <span aria-hidden>✨</span>
                <span>Sign up</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/reset-password" onClick={onNavigate} className={linkClass}>
                <span aria-hidden>🔑</span>
                <span>Reset password</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
