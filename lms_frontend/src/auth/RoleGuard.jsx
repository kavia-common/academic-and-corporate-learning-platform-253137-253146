import React from 'react';
import useSupabaseProfile from '../hooks/useSupabaseProfile';

/**
 * PUBLIC_INTERFACE
 * RoleGuard restricts rendering based on allowed roles ['admin','instructor','student'].
 * Shows a graceful Ocean Professional message when access is denied.
 */
export default function RoleGuard({ allow = [], children }) {
  const { profile, loading } = useSupabaseProfile();

  if (loading) {
    return <div aria-busy="true" style={{ padding: 12, color: '#4B5563' }}>Checking access…</div>;
  }
  if (!profile || (allow.length > 0 && !allow.includes(profile.role))) {
    return (
      <div role="alert" style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412', borderRadius: 10, padding: 12 }}>
        You don’t have permission to view this section. If you believe this is an error, contact an administrator.
      </div>
    );
  }
  return children;
}
