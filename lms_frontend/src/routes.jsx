import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';
import { useAuth } from './auth/AuthProvider';
import SignIn from './auth/pages/SignIn';
import SignUp from './auth/pages/SignUp';
import ResetPassword from './auth/pages/ResetPassword';
import VerifyEmail from './auth/pages/VerifyEmail';

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
        <Link className="link" to="/login">Sign in</Link>
        <Link className="link" to="/signup">Sign up</Link>
      </nav>
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
 * including protected and role-based routes and Supabase auth pages.
 */
export default function ApplicationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Auth pages */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

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
