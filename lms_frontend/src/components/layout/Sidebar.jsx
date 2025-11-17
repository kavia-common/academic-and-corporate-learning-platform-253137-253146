import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../ui/Button';

/**
 * PUBLIC_INTERFACE
 * Sidebar renders the primary navigation with a compact auth/user section at the very top.
 *
 * Props:
 * - items?: Array<{label:string,to:string,roles?:string[]}>
 * - onNavigate?: () => void - called after a nav link is clicked (useful for closing mobile drawer)
 *
 * Behavior:
 * - If items prop is provided, those are rendered and filtered by current role if link.roles is present.
 * - If not provided, defaults are rendered with role-based visibility.
 * - Avoids duplication of Admin nav placement by not auto-appending defaults when items are passed.
 */
export default function Sidebar({ items = [], onNavigate }) {
  const navigate = useNavigate();
  const { status, role, user, signOut } = useAuth();
  const isAuthed = status === 'authenticated';
  const r = String(role || '').toLowerCase();

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
    } catch {
      // swallow; upgrade later with toast
    }
  };

  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';

  const initials =
    (displayName || '')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const defaultItems = [
    ...(isAuthed ? [{ label: 'Dashboard', to: '/dashboard' }] : []),
    { label: 'Courses', to: '/courses' },
    { label: 'Quizzes', to: '/quizzes' },
    ...(isAuthed && r === 'student' ? [{ label: 'My Assignments', to: '/assignments' }] : []),
    ...(isAuthed ? [{ label: 'Profile', to: '/profile' }] : []),
    ...(isAuthed && r === 'admin' ? [{ label: 'Admin', to: '/admin', roles: ['admin'] }] : []),
  ];

  const links = items.length ? items : defaultItems;

  return (
    <nav aria-label="Primary Navigation" className="w-64 bg-white border-r border-gray-200">
      {/* Compact auth/user section */}
      <div className="p-4 border-b border-gray-100">
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
            <div className="text-sm text-gray-700" aria-hidden="true">
              Welcome
            </div>
            <Button onClick={handleSignIn} aria-label="Sign in" title="Sign in" size="sm">
              Sign in
            </Button>
          </div>
        )}
      </div>

      <ul className="p-4 space-y-1" role="list">
        {links
          .filter((link) => !link.roles || link.roles.includes(r))
          .map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} onClick={onNavigate} className={linkClass} end={link.to === '/'}>
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
      </ul>
    </nav>
  );
}
