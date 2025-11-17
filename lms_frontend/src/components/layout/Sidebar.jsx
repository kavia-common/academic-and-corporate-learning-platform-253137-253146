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

  return (
    <nav aria-label="Primary Navigation" style={{ padding: 12 }}>
      <div className="card" style={{ padding: 12, marginBottom: 12, background: 'var(--color-surface)' }}>
        <div
          style={{
            background: 'var(--gradient-soft)',
            borderRadius: 'var(--radius-md)',
            padding: 12
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            Ocean Professional
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
            Clean, modern LMS UI
          </div>
        </div>
      </div>

      <ul className="nav" role="list">
        <li>
          <NavLink to="/" end onClick={onNavigate}>
            <span>🏠</span>
            <span>Home</span>
          </NavLink>
        </li>

        {isAuthed && (
          <>
            <li>
              <NavLink to="/dashboard" onClick={onNavigate}>
                <span>📊</span>
                <span>Dashboard</span>
              </NavLink>
            </li>
            {r === 'student' && (
              <li>
                <NavLink to="/assignments" onClick={onNavigate}>
                  <span>📝</span>
                  <span>My Assignments</span>
                </NavLink>
              </li>
            )}
          </>
        )}

        <li>
          <NavLink to="/courses" onClick={onNavigate}>
            <span>🎓</span>
            <span>Courses</span>
          </NavLink>
        </li>

        {isAuthed && (r === 'admin') && (
          <li>
            <NavLink to="/admin" onClick={onNavigate}>
              <span>🛠️</span>
              <span>Admin</span>
            </NavLink>
          </li>
        )}

        {isAuthed && (r === 'instructor') && (
          <>
            <li>
              <NavLink to="/instructor" onClick={onNavigate}>
                <span>📚</span>
                <span>Instructor</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/assignments" onClick={onNavigate}>
                <span>📝</span>
                <span>Assignments</span>
              </NavLink>
            </li>
          </>
        )}

        {!isAuthed && (
          <>
            <li>
              <NavLink to="/login" onClick={onNavigate}>
                <span>🔐</span>
                <span>Sign in</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/signup" onClick={onNavigate}>
                <span>✨</span>
                <span>Sign up</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/reset-password" onClick={onNavigate}>
                <span>🔑</span>
                <span>Reset password</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
