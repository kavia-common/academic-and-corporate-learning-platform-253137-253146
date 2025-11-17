import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * PUBLIC_INTERFACE
 * RoleRoute component to restrict access to routes based on user roles.
 *
 * Props:
 * - allowedRoles: string[] - list of permitted roles (e.g., ['admin', 'instructor'])
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<RoleRoute allowedRoles={['admin']} />}>
 *       <Route path="/admin" element={<AdminPage />} />
 *     </Route>
 *   </Route>
 *
 * Behavior:
 * - Requires user to be authenticated (typically nested under ProtectedRoute).
 * - If the user's role is not in allowedRoles, redirect to '/' with a friendly message in state.
 */
export default function RoleRoute({ allowedRoles = [] }) {
  const { status, role } = useAuth();
  const location = useLocation();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading' || status === 'idle';
  const normalizedAllowed = Array.isArray(allowedRoles)
    ? allowedRoles.map((r) => (typeof r === 'string' ? r.toLowerCase() : r)).filter(Boolean)
    : [];

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  // If not authenticated, send them to login preserving destination
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If no allowedRoles provided, treat as open to any authenticated user
  if (normalizedAllowed.length === 0) {
    return <Outlet />;
  }

  const hasAccess = normalizedAllowed.includes(String(role).toLowerCase());

  if (!hasAccess) {
    // Redirect to a safe page with a friendly message
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
          notice: 'You do not have permission to access that page.',
        }}
      />
    );
  }

  return <Outlet />;
}
