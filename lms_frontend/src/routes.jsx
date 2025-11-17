import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';
import { useAuth } from './auth/AuthProvider';

// Simple demo pages for routing integration.
// In the full app, replace these with real pages/screens.

// PUBLIC_INTERFACE
export function HomePage() {
  /** Landing page showing any redirect notices. */
  const location = useLocation();
  const notice = location.state?.notice;

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Home</h1>
      {notice ? (
        <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>{notice}</p>
      ) : null}
      <nav style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <Link className="link" to="/dashboard">Dashboard</Link>
        <Link className="link" to="/admin">Admin</Link>
        <Link className="link" to="/instructor">Instructor</Link>
      </nav>
    </div>
  );
}

// PUBLIC_INTERFACE
export function LoginPage() {
  /** Minimal login placeholder. Implement real form later. */
  const { signIn } = useAuth();

  const handleDemoLogin = async (role) => {
    // This is a placeholder stub; real sign-in should use credentials.
    // For now, just inform users that login should be performed from header/sign-in page.
    // eslint-disable-next-line no-alert
    alert(`Please sign in via your normal sign-in flow. Requested role: ${role}`);
    // You might navigate or trigger a modal here in a full implementation.
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Login</h1>
      <p style={{ marginTop: 12 }}>Please sign in to continue.</p>
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={() => handleDemoLogin('student')}
          className="mr-2 px-3 py-2 rounded bg-blue-600 text-white"
        >
          Demo Sign In (Student)
        </button>
        <button
          type="button"
          onClick={() => handleDemoLogin('instructor')}
          className="mr-2 px-3 py-2 rounded bg-amber-500 text-white"
        >
          Demo Sign In (Instructor)
        </button>
        <button
          type="button"
          onClick={() => handleDemoLogin('admin')}
          className="px-3 py-2 rounded bg-gray-800 text-white"
        >
          Demo Sign In (Admin)
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <Link className="text-blue-600 underline" to="/">Back home</Link>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { user, role } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p style={{ marginTop: 12 }}>Welcome back, {user?.email || 'User'}!</p>
      <p style={{ marginTop: 4 }}>Your role: {role}</p>
    </div>
  );
}

function AdminPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p style={{ marginTop: 12 }}>Administrative controls and reports.</p>
    </div>
  );
}

function InstructorPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Instructor</h1>
      <p style={{ marginTop: 12 }}>Manage courses, assignments, and grades.</p>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * ApplicationRoutes: central routing configuration using React Router v6,
 * including protected and role-based routes.
 */
export default function ApplicationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected user routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Admin-only section */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Instructor-only section */}
        <Route element={<RoleRoute allowedRoles={['instructor']} />}>
          <Route path="/instructor" element={<InstructorPage />} />
        </Route>
      </Route>

      {/* Fallback to Home for unknown routes */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
