/**
 * Users service for Supabase with robust validation and error handling.
 * This module provides CRUD operations on the "users" profile table (not auth.users)
 * and selected helpers that interact with Supabase Auth for sign-in/up flows.
 */

import { supabase } from './client';
import { safeExec, shapeError, validatePayload, buildRange } from './utils';

// Expected schema for profile "users" table used across pages.
// Adjust fields to match your Supabase "users" (profile) table.
const USER_SCHEMA = {
  id: 'string',              // UUID - required for updates/deletes
  email: 'string',           // unique email
  role: 'string',            // 'admin' | 'instructor' | 'student'
  full_name: 'string',       // display name
  // avatar_url optional in create/update: we treat as 'any'
};

/**
 * Internal: verify supabase client readiness.
 */
function ensureClient() {
  if (!supabase) {
    return shapeError(new Error('Supabase client not initialized'), 'CONFIG_ERROR', 500);
  }
  return { ok: true };
}

// PUBLIC_INTERFACE
/**
 * Create a user profile record in "users" table.
 * Note: Supabase Auth user creation is separate (handled during sign up).
 * @param {{email:string, role:string, full_name:string, avatar_url?:string}} payload
 * @returns {Promise<{ok:true,data:any}|{ok:false,error:any}>}
 */
export async function createUser(payload) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  const requiredSchema = { email: 'string', role: 'string', full_name: 'string', avatar_url: 'any' };
  const valid = validatePayload(requiredSchema, payload || {});
  if (!valid.ok) return valid;

  return safeExec(async () => {
    const { data, error } = await supabase.from('users').insert(payload).select().single();
    return { data, error };
  }, 'USER_CREATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * Get a user profile by id.
 * @param {string} id
 */
export async function getUserById(id) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  if (!id || typeof id !== 'string') {
    return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  }
  return safeExec(async () => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    return { data, error };
  }, 'USER_FETCH_FAILED', 404);
}

// PUBLIC_INTERFACE
/**
 * Get a user profile by email.
 * @param {string} email
 */
export async function getUserByEmail(email) {
  const ready = ensureClient();
  if (!ready.ok) return ready;
  if (!email || typeof email !== 'string') {
    return shapeError(new Error('email is required'), 'VALIDATION_ERROR', 400);
  }
  return safeExec(async () => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    return { data, error };
  }, 'USER_FETCH_FAILED', 404);
}

// PUBLIC_INTERFACE
/**
 * List users with optional filters and pagination.
 * @param {{role?: string, search?: string, page?: number, pageSize?: number}} options
 */
export async function listUsers(options = {}) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  const { role, search, page = 1, pageSize = 20 } = options;
  const { from, to } = buildRange(page, pageSize);

  return safeExec(async () => {
    let query = supabase.from('users').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (role) query = query.eq('role', role);
    if (search) {
      // Simple ILIKE on name or email
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    const { data, error, count } = await query;
    return { data: { items: data, count }, error };
  }, 'USER_LIST_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * Update a user profile by id.
 * @param {string} id
 * @param {{email?:string, role?:string, full_name?:string, avatar_url?:string}} patch
 */
export async function updateUser(id, patch) {
  const ready = ensureClient();
  if (!ready.ok) return ready;
  if (!id || typeof id !== 'string') {
    return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  }
  if (!patch || typeof patch !== 'object' || !Object.keys(patch).length) {
    return shapeError(new Error('patch must be a non-empty object'), 'VALIDATION_ERROR', 400);
  }
  const allowedKeys = ['email', 'role', 'full_name', 'avatar_url'];
  const filtered = Object.keys(patch).reduce((acc, k) => {
    if (allowedKeys.includes(k)) acc[k] = patch[k];
    return acc;
  }, {});
  if (!Object.keys(filtered).length) {
    return shapeError(new Error('No valid fields to update'), 'VALIDATION_ERROR', 400);
  }

  return safeExec(async () => {
    const { data, error } = await supabase.from('users').update(filtered).eq('id', id).select().single();
    return { data, error };
  }, 'USER_UPDATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * Delete a user profile by id.
 * Note: This does not delete the Supabase Auth user.
 * @param {string} id
 */
export async function deleteUser(id) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  if (!id || typeof id !== 'string') {
    return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  }

  return safeExec(async () => {
    const { data, error } = await supabase.from('users').delete().eq('id', id).select().single();
    return { data, error };
  }, 'USER_DELETE_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * Update current auth user's password via Supabase Auth.
 * @param {string} newPassword
 */
export async function updatePassword(newPassword) {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return shapeError(new Error('Password must be at least 8 characters'), 'VALIDATION_ERROR', 400);
  }
  return safeExec(async () => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { data, error };
  }, 'PASSWORD_UPDATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * Get the current authenticated user from Supabase Auth session.
 */
export async function getCurrentAuthUser() {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  return safeExec(async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data: data?.user || null, error };
  }, 'AUTH_USER_FETCH_FAILED', 401);
}

/**
 * PUBLIC_INTERFACE
 * Get counts used by admin dashboard (users, courses, assignments, quizzes).
 * This aggregates simple counts from multiple tables.
 */
export async function getAdminCounts() {
  const ready = ensureClient();
  if (!ready.ok) return ready;

  return safeExec(async () => {
    const [{ count: usersCount, error: uErr }, { count: coursesCount, error: cErr }, { count: assignmentsCount, error: aErr }, { count: quizzesCount, error: qErr }] =
      await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('assignments').select('id', { count: 'exact', head: true }),
        supabase.from('quizzes').select('id', { count: 'exact', head: true }),
      ]);

    const combinedError = uErr || cErr || aErr || qErr || null;
    return {
      data: {
        users: usersCount ?? 0,
        courses: coursesCount ?? 0,
        assignments: assignmentsCount ?? 0,
        quizzes: quizzesCount ?? 0,
      },
      error: combinedError,
    };
  }, 'ADMIN_COUNTS_FAILED', 400);
}

/**
 * PUBLIC_INTERFACE
 * List recent items across key tables for admin dashboard.
 * @param {{limit?: number}} options - max number of items per category (default 5)
 * @returns {Promise<{ok:true,data:{users:any[],courses:any[],assignments:any[],quizzes:any[]}}|{ok:false,error:any}>}
 */
export async function listRecentItems(options = {}) {
  const limit = Number.isFinite(options.limit) && options.limit > 0 ? Math.min(20, options.limit) : 5;

  const ready = ensureClient();
  if (!ready.ok) return ready;

  return safeExec(async () => {
    const [
      { data: users, error: uErr },
      { data: courses, error: cErr },
      { data: assignments, error: aErr },
      { data: quizzes, error: qErr },
    ] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('courses').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('assignments').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('quizzes').select('*').order('created_at', { ascending: false }).limit(limit),
    ]);

    const error = uErr || cErr || aErr || qErr || null;
    return { data: { users: users || [], courses: courses || [], assignments: assignments || [], quizzes: quizzes || [] }, error };
  }, 'ADMIN_LIST_RECENT_FAILED', 400);
}

/**
 * PUBLIC_INTERFACE
 * getInstructorCounts - Aggregated metrics for a given instructor.
 * @param {string} instructorId
 * @returns {Promise<{ok:true,data:{courses:number,enrollments:number,assignments:number,quizzes:number,attempts:number}}|{ok:false,error:any}>}
 */
export async function getInstructorCounts(instructorId) {
  const ready = ensureClient();
  if (!ready.ok) return ready;
  if (!instructorId || typeof instructorId !== 'string') {
    return shapeError(new Error('instructorId is required'), 'VALIDATION_ERROR', 400);
  }

  return safeExec(async () => {
    const [
      { count: coursesCount, error: cErr },
      { count: enrollCount, error: eErr },
      { count: assignmentsCount, error: aErr },
      { count: quizzesCount, error: qErr },
      { count: attemptsCount, error: tErr },
    ] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('instructor_id', instructorId),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('instructor_id', instructorId),
      supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('instructor_id', instructorId),
      supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('instructor_id', instructorId),
      supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('instructor_id', instructorId),
    ]);

    const error = cErr || eErr || aErr || qErr || tErr || null;
    return {
      data: {
        courses: coursesCount ?? 0,
        enrollments: enrollCount ?? 0,
        assignments: assignmentsCount ?? 0,
        quizzes: quizzesCount ?? 0,
        attempts: attemptsCount ?? 0,
      },
      error,
    };
  }, 'INSTRUCTOR_COUNTS_FAILED', 400);
}

/**
 * PUBLIC_INTERFACE
 * listRecentItems (instructor scope) - recent courses/quizzes/assignments owned by instructor.
 * @param {{role:'instructor', userId:string, limit?:number}} options
 */
export async function listRecentItemsForInstructor(options = {}) {
  const { userId, limit: rawLimit } = options || {};
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(20, rawLimit) : 5;

  const ready = ensureClient();
  if (!ready.ok) return ready;
  if (!userId || typeof userId !== 'string') {
    return shapeError(new Error('userId is required'), 'VALIDATION_ERROR', 400);
  }

  return safeExec(async () => {
    const [
      { data: courses, error: cErr },
      { data: quizzes, error: qErr },
      { data: assignments, error: aErr },
    ] = await Promise.all([
      supabase.from('courses').select('*').eq('instructor_id', userId).order('created_at', { ascending: false }).limit(limit),
      supabase.from('quizzes').select('*').eq('instructor_id', userId).order('created_at', { ascending: false }).limit(limit),
      supabase.from('assignments').select('*').eq('instructor_id', userId).order('created_at', { ascending: false }).limit(limit),
    ]);

    const error = cErr || qErr || aErr || null;
    return { data: { courses: courses || [], quizzes: quizzes || [], assignments: assignments || [] }, error };
  }, 'INSTRUCTOR_LIST_RECENT_FAILED', 400);
}

/**
 * PUBLIC_INTERFACE
 * getStudentCounts - Aggregated metrics for a given student/user.
 * @param {string} studentId
 * @returns {Promise<{ok:true,data:{courses:number,enrollments:number,assignments:number,quizzes:number,attempts:number}}|{ok:false,error:any}>}
 */
export async function getStudentCounts(studentId) {
  const ready = ensureClient();
  if (!ready.ok) return ready;
  if (!studentId || typeof studentId !== 'string') {
    return shapeError(new Error('studentId is required'), 'VALIDATION_ERROR', 400);
  }

  return safeExec(async () => {
    const [
      // number of distinct courses via enrollments
      { count: enrollCount, error: eErr },
      // assignments available to this student (e.g., by enrollment mapping)
      { count: assignmentsCount, error: aErr },
      // quizzes available to this student (by enrollment or visibility)
      { count: quizzesCount, error: qErr },
      // attempts made by this student
      { count: attemptsCount, error: tErr },
    ] = await Promise.all([
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
      supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
      supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
      supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
    ]);

    // courses equals enrollments for dashboard display; if schema includes course link different from enrollments, adjust accordingly
    const error = eErr || aErr || qErr || tErr || null;
    return {
      data: {
        courses: enrollCount ?? 0,
        enrollments: enrollCount ?? 0,
        assignments: assignmentsCount ?? 0,
        quizzes: quizzesCount ?? 0,
        attempts: attemptsCount ?? 0,
      },
      error,
    };
  }, 'STUDENT_COUNTS_FAILED', 400);
}
