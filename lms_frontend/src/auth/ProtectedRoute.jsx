import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute component to enforce authentication.
 *
 * Usage with React Router v6:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 * Behavior:
 * - If user is authenticated, renders nested routes via <Outlet />.
 * - If not, redirects to /login and preserves the intended location in state.
 */
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  const isAuthenticated = status === 'authenticated';

  if (status === 'loading' || status === 'idle') {
    // Optional: render a simple loader to avoid flicker while auth initializes
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login, preserving where they wanted to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
