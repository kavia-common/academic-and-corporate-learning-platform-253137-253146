import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute ensures that only authenticated users can access the wrapped route.
 * Unauthenticated users are redirected to /auth/login with a redirect back to the original path.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (!isConfigured) {
    // If auth isn't configured, allow access (behave as public) to avoid blocking app usage
    return children;
  }

  if (loading) {
    return (
      <div aria-busy="true" style={{ padding: 24 }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    const redirectTo = `/auth/login?next=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
