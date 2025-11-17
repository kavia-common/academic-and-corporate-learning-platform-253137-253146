import supabase from './client';

/**
 * Supabase helper functions to fetch counts and recent items for dashboards.
 * Assumed schema:
 * - courses(id, title, description, instructor_id, created_at)
 * - enrollments(id, course_id, user_id, created_at)
 * - assignments(id, course_id, title, due_date, created_at)
 * - quizzes(id, course_id, title, created_at)
 * - quiz_attempts(id, quiz_id, user_id, score, total_points, created_at)
 *
 * All functions scope data based on role where applicable.
 */

// INTERNAL: safe count utility
async function countFrom(table, filters = (q) => q) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  query = filters(query);
  const { count, error } = await query;
  if (error) throw new Error(`Failed to count ${table}.`);
  return count || 0;
}

// PUBLIC_INTERFACE
export async function getAdminCounts() {
  /**
   * Returns total counts for the whole system for admin dashboards.
   * {
   *   courses, enrollments, assignments, quizzes, attempts
   * }
   */
  const [courses, enrollments, assignments, quizzes, attempts] = await Promise.all([
    countFrom('courses'),
    countFrom('enrollments'),
    countFrom('assignments'),
    countFrom('quizzes'),
    countFrom('quiz_attempts'),
  ]);
  return { courses, enrollments, assignments, quizzes, attempts };
}

// PUBLIC_INTERFACE
export async function getInstructorCounts(instructorId) {
  /**
   * Returns counts scoped to instructor ownership.
   * - courses where instructor_id = me
   * - enrollments for my courses
   * - assignments under my courses
   * - quizzes under my courses
   * - attempts on quizzes under my courses
   */
  if (!instructorId) throw new Error('Missing instructor id');

  // Helper: list course ids owned by instructor
  const { data: myCourses, error: cErr } = await supabase
    .from('courses')
    .select('id')
    .eq('instructor_id', instructorId);
  if (cErr) throw new Error('Failed to load instructor courses.');
  const courseIds = (myCourses || []).map((c) => c.id);
  if (courseIds.length === 0) {
    return { courses: 0, enrollments: 0, assignments: 0, quizzes: 0, attempts: 0 };
  }

  // Quizzes ids under my courses
  const { data: myQuizzes, error: qErr } = await supabase
    .from('quizzes')
    .select('id')
    .in('course_id', courseIds);
  if (qErr) throw new Error('Failed to load instructor quizzes.');
  const quizIds = (myQuizzes || []).map((q) => q.id);

  const [courses, enrollments, assignments, quizzes, attempts] = await Promise.all([
    countFrom('courses', (q) => q.eq('instructor_id', instructorId)),
    countFrom('enrollments', (q) => q.in('course_id', courseIds)),
    countFrom('assignments', (q) => q.in('course_id', courseIds)),
    countFrom('quizzes', (q) => q.in('course_id', courseIds)),
    quizIds.length > 0 ? countFrom('quiz_attempts', (q) => q.in('quiz_id', quizIds)) : Promise.resolve(0),
  ]);

  return { courses, enrollments, assignments, quizzes, attempts };
}

// PUBLIC_INTERFACE
export async function getStudentCounts(studentId) {
  /**
   * Returns counts for a student:
   * - courses enrolled (via enrollments.user_id = me)
   * - enrollments (same as courses)
   * - assignments across enrolled courses (best-effort if schema supports joining; fallback: all assignments)
   * - quizzes across enrolled courses (fallback: all quizzes)
   * - attempts by me
   */
  if (!studentId) throw new Error('Missing student id');

  const enrollments = await countFrom('enrollments', (q) => q.eq('user_id', studentId));

  // get course ids enrolled by student
  const { data: myEnrolls, error: eErr } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', studentId);
  if (eErr) throw new Error('Failed to load enrollments.');
  const courseIds = (myEnrolls || []).map((e) => e.course_id);

  const assignments =
    courseIds.length > 0
      ? await countFrom('assignments', (q) => q.in('course_id', courseIds))
      : await countFrom('assignments'); // fallback

  const quizzes =
    courseIds.length > 0
      ? await countFrom('quizzes', (q) => q.in('course_id', courseIds))
      : await countFrom('quizzes'); // fallback

  const attempts = await countFrom('quiz_attempts', (q) => q.eq('user_id', studentId));

  // courses count equals number of enrollments (unless duplicates exist)
  const courses = enrollments;

  return { courses, enrollments, assignments, quizzes, attempts };
}

// PUBLIC_INTERFACE
export async function listRecentItems({ role, userId, limit = 5 } = {}) {
  /**
   * Returns recent items for dashboard side lists.
   * - Admin: recent courses, quizzes, assignments (global)
   * - Instructor: recent courses/quizzes/assignments under instructor
   * - Student: recent enrollments (courses), assigned assignments (fallback: global), recent attempts
   */
  const r = String(role || '').toLowerCase();
  const lim = Math.max(1, Math.min(20, Number(limit) || 5));

  if (r === 'admin') {
    const [courses, quizzes, assignments] = await Promise.all([
      supabase.from('courses').select('id,title,created_at').order('created_at', { ascending: false }).limit(lim),
      supabase.from('quizzes').select('id,title,created_at').order('created_at', { ascending: false }).limit(lim),
      supabase.from('assignments').select('id,title,created_at').order('created_at', { ascending: false }).limit(lim),
    ]);
    if (courses.error || quizzes.error || assignments.error) throw new Error('Failed to load recent items.');
    return {
      courses: courses.data || [],
      quizzes: quizzes.data || [],
      assignments: assignments.data || [],
    };
  }

  if (r === 'instructor') {
    if (!userId) throw new Error('Missing instructor id');
    const [courses, quizzes, assignments] = await Promise.all([
      supabase
        .from('courses')
        .select('id,title,created_at')
        .eq('instructor_id', userId)
        .order('created_at', { ascending: false })
        .limit(lim),
      supabase
        .from('quizzes')
        .select('id,title,created_at,course_id')
        .order('created_at', { ascending: false })
        .limit(200), // get many then filter client-side by my courses
      supabase
        .from('assignments')
        .select('id,title,created_at,course_id')
        .order('created_at', { ascending: false })
        .limit(200),
    ]);
    if (courses.error || quizzes.error || assignments.error) throw new Error('Failed to load recent items.');

    const myCourseIds = (courses.data || []).map((c) => c.id);
    const quizzesFiltered = (quizzes.data || []).filter((q) => myCourseIds.includes(q.course_id)).slice(0, lim);
    const assignmentsFiltered = (assignments.data || []).filter((a) => myCourseIds.includes(a.course_id)).slice(0, lim);

    return {
      courses: courses.data || [],
      quizzes: quizzesFiltered,
      assignments: assignmentsFiltered,
    };
  }

  // student
  if (!userId) throw new Error('Missing student id');

  const [enrollments, assignments, attempts] = await Promise.all([
    supabase
      .from('enrollments')
      .select('id,course_id,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(lim),
    supabase.from('assignments').select('id,title,created_at,course_id').order('created_at', { ascending: false }).limit(200),
    supabase
      .from('quiz_attempts')
      .select('id,quiz_id,score,total_points,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(lim),
  ]);

  if (enrollments.error || assignments.error || attempts.error) throw new Error('Failed to load recent items.');

  const myCourseIds = (enrollments.data || []).map((e) => e.course_id);
  const myAssignments =
    myCourseIds.length > 0
      ? (assignments.data || []).filter((a) => myCourseIds.includes(a.course_id)).slice(0, lim)
      : (assignments.data || []).slice(0, lim);

  return {
    enrollments: enrollments.data || [],
    assignments: myAssignments,
    attempts: attempts.data || [],
  };
}

export default {
  getAdminCounts,
  getInstructorCounts,
  getStudentCounts,
  listRecentItems,
};
