import { supabase } from './client';
import { safeExec, shapeError, validatePayload, buildRange } from './utils';

// PUBLIC_INTERFACE
/** Fetch list of courses with optional pagination. Always resolves with an array (possibly empty). */
export async function fetchCourses(options = {}) {
  const { page = 1, pageSize = 50 } = options;
  const { from, to } = buildRange(page, pageSize);
  const res = await safeExec(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    return { data, error };
  }, 'COURSE_LIST_FAILED', 400);

  // Normalize to array on success, maintain error shape otherwise
  if (res && res.ok) {
    return {
      ...res,
      data: Array.isArray(res.data) ? res.data : [],
    };
  }
  return res;
}

// Backward compatibility helper returning bare array or throws for consumers expecting direct array
export const listCourses = async (options = {}) => {
  const res = await fetchCourses(options);
  if (!res.ok) {
    throw new Error(res.error?.message || 'Failed to load courses');
  }
  return Array.isArray(res.data) ? res.data : [];
};

// PUBLIC_INTERFACE
/** Fetch single course by id. */
export async function fetchCourseById(id) {
  if (!id) return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  return safeExec(async () => {
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
    return { data, error };
  }, 'COURSE_FETCH_FAILED', 404);
}

/**
 * PUBLIC_INTERFACE
 * Create a new course.
 * Supports optional fields: description, video_url, created_by.
 */
export async function createCourse(course) {
  // Validate required fields only: title
  const required = { title: 'string' };
  const valid = validatePayload(required, course || {});
  if (!valid.ok) return valid;

  // Normalize fields; created_by used for admin ownership context
  const payload = {
    title: course.title,
    description: typeof course.description === 'string' ? course.description : null,
    video_url: course.video_url ? String(course.video_url) : null,
    created_by: course.created_by || null,
  };

  return safeExec(async () => {
    const { data, error } = await supabase.from('courses').insert(payload).select().single();
    return { data, error };
  }, 'COURSE_CREATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Update a course by id. */
export async function updateCourse(id, updates) {
  if (!id) return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  if (!updates || typeof updates !== 'object' || !Object.keys(updates).length) {
    return shapeError(new Error('updates must be non-empty object'), 'VALIDATION_ERROR', 400);
  }
  return safeExec(async () => {
    const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
    return { data, error };
  }, 'COURSE_UPDATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Delete a course by id. */
export async function deleteCourse(id) {
  if (!id) return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  return safeExec(async () => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    return { data: true, error };
  }, 'COURSE_DELETE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Enroll user to course (optional helper to support existing pages). */
export async function enrollInCourse({ course_id, user_id }) {
  if (!course_id || !user_id) {
    return shapeError(new Error('course_id and user_id are required'), 'VALIDATION_ERROR', 400);
  }
  return safeExec(async () => {
    // prevent duplicate enrollments
    const { data: existing, error: checkErr } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', course_id)
      .eq('user_id', user_id)
      .maybeSingle();
    if (checkErr) return { data: null, error: checkErr };
    if (existing) return { data: existing, error: null };
    const { data, error } = await supabase.from('enrollments').insert({ course_id, user_id }).select().single();
    return { data, error };
  }, 'COURSE_ENROLL_FAILED', 400);
}
