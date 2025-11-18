import React from 'react';
import RoleGuard from '../auth/RoleGuard';

/**
 * PUBLIC_INTERFACE
 * Users page placeholder. Restricted to admin and instructor roles.
 */
export default function Users() {
  return (
    <section>
      <h1>Users</h1>
      <RoleGuard allow={['admin', 'instructor']}>
        <p>This is a placeholder for Users management.</p>
      </RoleGuard>
    </section>
  );
}
