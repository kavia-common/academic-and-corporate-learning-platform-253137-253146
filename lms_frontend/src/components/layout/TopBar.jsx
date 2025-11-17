import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * TopBar renders the application top app bar with brand, search, and user actions.
 *
 * Props:
 * - onMenuToggle: function - toggles the sidebar on small screens
 */
export default function TopBar({ onMenuToggle }) {
  const { status, user, signOut } = useAuth();
  const isAuthed = status === 'authenticated';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={onMenuToggle}
          className="btn"
          style={{
            background: 'var(--color-secondary)',
            color: '#111827',
            padding: '8px 10px',
          }}
        >
          ☰
        </button>
        <Link to="/" className="link" aria-label="Go to home">
          <strong style={{ color: 'var(--color-primary)' }}>LMS</strong>
          <span style={{ marginLeft: 6, color: 'var(--color-text-muted)' }}>
            Ocean Pro
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="search"
          placeholder="Search"
          className="topbar-search"
          aria-label="Search the application"
        />
        <Link to="/courses" className="link" aria-label="Browse courses" style={{ marginRight: 8 }}>
          Courses
        </Link>
        <Link to="/quizzes" className="link" aria-label="Browse quizzes" style={{ marginRight: 8 }}>
          Quizzes
        </Link>
        {isAuthed ? (
          <>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              {user?.email}
            </span>
            <button
              type="button"
              className="btn"
              onClick={() => signOut().catch(() => {})}
              aria-label="Sign out"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link to="/login" className="btn" aria-label="Sign in">Sign in</Link>
        )}
      </div>
    </div>
  );
}
