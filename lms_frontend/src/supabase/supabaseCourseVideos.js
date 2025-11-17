import { supabase } from './client';
import { safeExec, shapeError, validatePayload } from './utils';

// PUBLIC_INTERFACE
/**
 * Insert a course video row for given course.
 * @param {{ course_id: string|number, title?: string, url: string, created_by?: string }} payload
 * @returns {Promise<{id: any, course_id: any, title: string|null, url: string, created_at: string}>>}
 */
export async function addCourseVideo(payload = {}) {
  const schema = { course_id: 'any', url: 'string' };
  const valid = validatePayload(schema, payload);
  if (!valid.ok) return valid;

  const row = {
    course_id: payload.course_id,
    title: typeof payload.title === 'string' ? payload.title : null,
    url: String(payload.url),
    created_by: payload.created_by || null,
  };

  return safeExec(async () => {
    const { data, error } = await supabase
      .from('course_videos')
      .insert(row)
      .select()
      .single();
    return { data, error };
  }, 'COURSE_VIDEO_INSERT_FAILED', 400);
}

// PUBLIC_INTERFACE
/**
 * List videos for a course id.
 * @param {string|number} courseId
 */
export async function listCourseVideos(courseId) {
  if (!courseId) return shapeError(new Error('courseId is required'), 'VALIDATION_ERROR', 400);
  return safeExec(async () => {
    const { data, error } = await supabase
      .from('course_videos')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });
    return { data, error };
  }, 'COURSE_VIDEO_LIST_FAILED', 400);
}
