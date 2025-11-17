//
// PUBLIC INTERFACE
// Role utilities and access control helpers for the LMS frontend.
//

/**
 * PUBLIC_INTERFACE
 * ROLE constants used across the application.
 */
export const ROLE = Object.freeze({
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
});

/**
 * PUBLIC_INTERFACE
 * Check if a user's role is within the allowed roles.
 *
 * @param {string|null|undefined} userRole - The role to check.
 * @param {string[]|Set<string>} allowed - Allowed roles.
 * @returns {boolean} True if allowed.
 */
export function isRole(userRole, allowed) {
  if (!userRole || !allowed) return false;
  const set = Array.isArray(allowed) ? new Set(allowed) : allowed;
  return set.has(userRole);
}

/**
 * PUBLIC_INTERFACE
 * canAccess - route guard helper stub used by navigation/guards to decide if a role
 * can access a given path. This is intentionally simple and can be expanded.
 *
 * @param {string} path - pathname starting with "/"
 * @param {string} role - user role
 * @returns {boolean} True if the role may access the path.
 */
export function canAccess(path, role) {
  if (!path || !role) return false;

  // Basic path-based policy. Adjust as routes evolve.
  // Admin: full access.
  if (role === ROLE.ADMIN) return true;

  // Instructor areas
  if (path.startsWith('/instructor') || path.startsWith('/quizzes') || path.startsWith('/assignments')) {
    return role === ROLE.INSTRUCTOR || role === ROLE.ADMIN;
  }

  // Student areas
  if (path.startsWith('/student') || path.startsWith('/courses')) {
    return role === ROLE.STUDENT || role === ROLE.INSTRUCTOR || role === ROLE.ADMIN;
  }

  // Public/common pages
  const publicPrefixes = ['/', '/signin', '/signup', '/verify-email', '/reset-password'];
  if (publicPrefixes.some((p) => path === p || path.startsWith(p))) {
    return true;
  }

  // Default deny
  return false;
}
