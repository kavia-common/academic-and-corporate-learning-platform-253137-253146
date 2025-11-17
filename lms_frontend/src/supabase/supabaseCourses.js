import supabase from './client';

/**
 * Supabase Courses data access layer
 * Provides CRUD and enrollment operations against 'courses' and 'enrollments' tables.
 * Assumptions:
 * - 'courses' table: id (uuid), title (text), description (text), instructor_id (uuid), created_at (timestamp)
 * - 'enrollments' table: id (uuid), course_id (uuid), user_id (uuid), created_at (timestamp)
 * Adjust column names as needed to match the actual schema.
 */

// PUBLIC_INTERFACE
export async function listCourses({ instructorId } = {}) {
  /** List courses; optionally filter by instructorId */
  let query = supabase.from('courses').select('*').order('created_at', { ascending: false });
  if (instructorId) {
    query = query.eq('instructor_id', instructorId);
  }
  const { data, error } = await query;
  if (error) {
    throw new Error('Failed to load courses.');
  }
  return data || [];
}

// PUBLIC_INTERFACE
export async function getCourseById(id) {
  /** Fetch a single course by id */
  const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
  if (error) {
    throw new Error('Course not found.');
  }
  return data;
}

// PUBLIC_INTERFACE
export async function createCourse({ title, description, instructor_id }) {
  /** Create a course; requires instructor_id of current user */
  const payload = {
    title: String(title || '').trim(),
    description: String(description || '').trim(),
    instructor_id,
  };
  if (!payload.title) throw new Error('Title is required');
  const { data, error } = await supabase.from('courses').insert(payload).select('*').single();
  if (error) throw new Error('Failed to create course.');
  return data;
}

// PUBLIC_INTERFACE
export async function updateCourse(id, { title, description }) {
  /** Update mutable fields of a course */
  const updates = {};
  if (typeof title === 'string') updates.title = title.trim();
  if (typeof description === 'string') updates.description = description.trim();

  const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select('*').single();
  if (error) throw new Error('Failed to update course.');
  return data;
}

// PUBLIC_INTERFACE
export async function enrollInCourse({ course_id, user_id }) {
  /** Enroll a user into a course (student action) */
  if (!course_id || !user_id) throw new Error('Invalid enrollment request.');
  // prevent duplicate enrollment (basic guard)
  const { data: existing, error: checkErr } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', course_id)
    .eq('user_id', user_id)
    .maybeSingle();
  if (checkErr) throw new Error('Failed to check enrollment.');
  if (existing) {
    return existing;
  }
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ course_id, user_id })
    .select('*')
    .single();
  if (error) throw new Error('Failed to enroll in course.');
  return data;
}

export default {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  enrollInCourse,
};
