import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../ui/Button';

/**
 * PUBLIC_INTERFACE
 * Sidebar renders the primary navigation with a compact auth/user section at the very top.
 *
 * Props:
 * - onNavigate: function - called after a nav link is clicked (useful for closing mobile drawer)
 */
export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const { status, role, user, signOut } = useAuth();
  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

  // Helper to apply active styles consistently
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
    }`;

  const handleSignIn = () => {
    navigate('/login');
    onNavigate?.();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate?.();
      navigate('/', { replace: true, state: { notice: 'Signed out successfully.' } });
    } catch (_) {
      // Non-intrusive; could enhance with toast later.
    }
  };

  // Derive user display
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    'User';

  const initials =
    (displayName || '')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <nav aria-label="Primary Navigation" style={{ padding: 12, background: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Compact auth/user section at the very top */}
      <div
        className="auth-compact"
        style={{ padding: 12, marginBottom: 12, background: 'var(--color-surface)', border: '1px solid rgba(17,24,39,0.08)', borderRadius: 8 }}
        aria-label={isAuthed ? 'User details' : 'Sign in prompt'}
      >
        {isAuthed ? (
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/profile"
              onClick={onNavigate}
              className="group flex items-center gap-3 min-w-0"
              aria-label="Open profile"
              title="Profile"
            >
              <div
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10 text-blue-700 font-semibold"
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-gray-900">{displayName}</div>
                <div className="truncate text-xs text-gray-500 capitalize">{r || 'student'}</div>
              </div>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700" aria-hidden="true">Welcome</div>
            <Button
              onClick={handleSignIn}
              aria-label="Sign in"
              title="Sign in"
              size="sm"
            >
              Sign in
            </Button>
          </div>
        )}
      </div>

      {/* Keep navigation list below in the configured order (Home and Admin below Profile as previously configured) */}
      <ul className="nav" role="list" style={{ display: 'grid', gap: 6 }}>
        <li>
          <NavLink
            to="/"
            onClick={onNavigate}
            className={linkClass}
            end
            aria-label="Home"
            title="Home"
          >
            <span aria-hidden>🏠</span>
            <span>Home</span>
          </NavLink>
        </li>

        {isAuthed && (
          <li>
            <NavLink
              to="/dashboard"
              onClick={onNavigate}
              className={linkClass}
              end
              aria-label="Dashboard"
              title="Dashboard"
            >
              <span aria-hidden>📊</span>
              <span>Dashboard</span>
            </NavLink>
          </li>
        )}

        <li>
          <NavLink
            to="/courses"
            onClick={onNavigate}
            className={linkClass}
            aria-label="Courses"
            title="Courses"
          >
            <span aria-hidden>🎓</span>
            <span>Courses</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/quizzes" onClick={onNavigate} className={linkClass} aria-label="Quizzes" title="Quizzes">
            <span aria-hidden>❓</span>
            <span>Quizzes</span>
          </NavLink>
        </li>

        {isAuthed && r === 'student' && (
          <li>
            <NavLink to="/assignments" onClick={onNavigate} className={linkClass} aria-label="My Assignments" title="My Assignments">
              <span aria-hidden>📝</span>
              <span>My Assignments</span>
            </NavLink>
          </li>
        )}

        {isAuthed && r === 'instructor' && (
          <>
            <li>
              <NavLink to="/instructor" onClick={onNavigate} className={linkClass} aria-label="Instructor" title="Instructor">
                <span aria-hidden>📚</span>
                <span>Instructor</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/assignments" onClick={onNavigate} className={linkClass} aria-label="Assignments" title="Assignments">
                <span aria-hidden>📝</span>
                <span>Assignments</span>
              </NavLink>
            </li>
          </>
        )}

        {isAuthed ? (
          <>
            <li>
              <NavLink to="/profile" onClick={onNavigate} className={linkClass} aria-label="Profile" title="Profile">
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
                <NavLink to="/admin" onClick={onNavigate} className={linkClass} end aria-label="Admin" title="Admin">
                  <span aria-hidden>🛠️</span>
                  <span>Admin</span>
                </NavLink>
              </li>
            )}
          </>
        ) : null}
      </ul>
    </nav>
  );
}
