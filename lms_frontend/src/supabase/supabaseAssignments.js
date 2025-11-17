import { supabase } from './client';
import { safeExec, shapeError, validatePayload, buildRange } from './utils';

// PUBLIC_INTERFACE
/** Fetch assignments optionally filtered by courseId, with pagination. */
export async function fetchAssignments(courseId, options = {}) {
  const { page = 1, pageSize = 100 } = options;
  const { from, to } = buildRange(page, pageSize);
  return safeExec(async () => {
    let query = supabase.from('assignments').select('*').order('due_date', { ascending: true }).range(from, to);
    if (courseId) query = query.eq('course_id', courseId);
    const { data, error } = await query;
    return { data, error };
  }, 'ASSIGNMENT_LIST_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Fetch a single assignment by id. */
export async function fetchAssignmentById(id) {
  if (!id) return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  return safeExec(async () => {
    const { data, error } = await supabase.from('assignments').select('*').eq('id', id).single();
    return { data, error };
  }, 'ASSIGNMENT_FETCH_FAILED', 404);
}

// PUBLIC_INTERFACE
/** Create a new assignment. */
export async function createAssignment(assignment) {
  const required = { title: 'string', description: 'string', course_id: 'string', due_date: 'string' };
  const valid = validatePayload(required, assignment || {});
  if (!valid.ok) return valid;

  return safeExec(async () => {
    const { data, error } = await supabase.from('assignments').insert(assignment).select().single();
    return { data, error };
  }, 'ASSIGNMENT_CREATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Update an assignment. */
export async function updateAssignment(id, updates) {
  if (!id) return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  if (!updates || typeof updates !== 'object' || !Object.keys(updates).length) {
    return shapeError(new Error('updates must be non-empty object'), 'VALIDATION_ERROR', 400);
  }
  return safeExec(async () => {
    const { data, error } = await supabase.from('assignments').update(updates).eq('id', id).select().single();
    return { data, error };
  }, 'ASSIGNMENT_UPDATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Delete an assignment. */
export async function deleteAssignment(id) {
  if (!id) return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  return safeExec(async () => {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    return { data: true, error };
  }, 'ASSIGNMENT_DELETE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** List submissions for an assignment (instructor/admin). */
export async function listSubmissions(assignmentId, options = {}) {
  if (!assignmentId) return shapeError(new Error('assignmentId is required'), 'VALIDATION_ERROR', 400);
  const { page = 1, pageSize = 200 } = options;
  const { from, to } = buildRange(page, pageSize);
  return safeExec(async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false })
      .range(from, to);
    return { data, error };
  }, 'SUBMISSION_LIST_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Submit an assignment (student). */
export async function submitAssignment({ assignment_id, student_id, content, file_url }) {
  if (!assignment_id || !student_id) {
    return shapeError(new Error('assignment_id and student_id are required'), 'VALIDATION_ERROR', 400);
  }
  const payload = {
    assignment_id,
    student_id,
    content: String(content || '').trim(),
    file_url: file_url || null,
  };
  return safeExec(async () => {
    const { data, error } = await supabase.from('submissions').insert(payload).select().single();
    return { data, error };
  }, 'SUBMISSION_CREATE_FAILED', 400);
}

// Backward compatibility named exports used by pages in this repo
export const listAssignmentsByCourse = async (courseId, options = {}) => {
  const res = await fetchAssignments(courseId, options);
  if (!res.ok) throw new Error(res.error?.message || 'Failed to load assignments');
  return res.data;
};
export const getAssignmentById = async (id) => {
  const res = await fetchAssignmentById(id);
  if (!res.ok) throw new Error(res.error?.message || 'Assignment not found');
  return res.data;
};
