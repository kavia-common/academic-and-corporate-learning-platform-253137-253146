import supabase from './client';

/**
 * Supabase Assignments and Submissions data access layer.
 * Assumed schema:
 * - assignments: id (uuid), course_id (uuid), title (text), description (text), due_date (timestamp), created_by (uuid), created_at (timestamp)
 * - submissions: id (uuid), assignment_id (uuid), student_id (uuid), content (text), file_url (text), created_at (timestamp)
 * Adjust/select columns to match your backend.
 */

// PUBLIC_INTERFACE
export async function listAssignmentsByCourse(courseId) {
  /** List assignments for a given course */
  if (!courseId) throw new Error('Course ID is required');
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('course_id', courseId)
    .order('due_date', { ascending: true });
  if (error) throw new Error('Failed to load assignments.');
  return data || [];
}

// PUBLIC_INTERFACE
export async function listMyAssignments(studentId) {
  /**
   * List assignments for a student.
   * Note: This could be all assignments from courses the user is enrolled in.
   * For simplicity, we return all assignments if you don't have a join view.
   * Consider creating a view to join enrollments -> assignments for production.
   */
  // Fallback to all assignments if there's no join
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .order('due_date', { ascending: true });
  if (error) throw new Error('Failed to load your assignments.');
  return data || [];
}

// PUBLIC_INTERFACE
export async function getAssignmentById(id) {
  /** Fetch a single assignment by id */
  const { data, error } = await supabase.from('assignments').select('*').eq('id', id).single();
  if (error) throw new Error('Assignment not found.');
  return data;
}

// PUBLIC_INTERFACE
export async function createAssignment({ course_id, title, description, due_date, created_by }) {
  /** Create a new assignment (instructor/admin only) */
  const payload = {
    course_id,
    title: String(title || '').trim(),
    description: String(description || '').trim(),
    due_date: due_date || null,
    created_by,
  };
  if (!payload.course_id) throw new Error('Course is required.');
  if (!payload.title) throw new Error('Title is required.');
  const { data, error } = await supabase.from('assignments').insert(payload).select('*').single();
  if (error) throw new Error('Failed to create assignment.');
  return data;
}

// PUBLIC_INTERFACE
export async function submitAssignment({ assignment_id, student_id, content, file_url }) {
  /** Create a submission for an assignment (student) */
  if (!assignment_id || !student_id) throw new Error('Invalid submission request.');
  const payload = {
    assignment_id,
    student_id,
    content: String(content || '').trim(),
    file_url: file_url || null,
  };
  const { data, error } = await supabase.from('submissions').insert(payload).select('*').single();
  if (error) throw new Error('Failed to submit assignment.');
  return data;
}

// PUBLIC_INTERFACE
export async function listSubmissions(assignmentId) {
  /** List submissions for an assignment (instructor/admin) */
  if (!assignmentId) throw new Error('Assignment ID is required');
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Failed to load submissions.');
  return data || [];
}

export default {
  listAssignmentsByCourse,
  listMyAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  listSubmissions,
};
