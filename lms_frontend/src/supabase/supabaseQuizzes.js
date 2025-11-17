import supabase from './client';

/**
 * Supabase Quizzes data access layer.
 * Assumed schema:
 * - quizzes: id (uuid), course_id (uuid), title (text), description (text), created_by (uuid), created_at (timestamp)
 * - quiz_questions: id (uuid), quiz_id (uuid), prompt (text), options (jsonb text[] or json), correct_index (int), points (int)
 * - quiz_attempts: id (uuid), quiz_id (uuid), user_id (uuid), score (int), total_points (int), answers (jsonb), created_at (timestamp)
 * Adjust column/table names as needed for your backend.
 */

// PUBLIC_INTERFACE
export async function listQuizzes({ courseId } = {}) {
  /** List quizzes; optionally filter by courseId */
  let query = supabase.from('quizzes').select('*').order('created_at', { ascending: false });
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error('Failed to load quizzes.');
  return data || [];
}

// PUBLIC_INTERFACE
export async function getQuizById(id) {
  /** Fetch a quiz by id */
  const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
  if (error) throw new Error('Quiz not found.');
  return data;
}

// PUBLIC_INTERFACE
export async function createQuiz({ course_id, title, description, created_by }) {
  /** Create quiz metadata (instructor/admin) */
  const payload = {
    course_id,
    title: String(title || '').trim(),
    description: String(description || '').trim(),
    created_by,
  };
  if (!payload.course_id) throw new Error('Course is required.');
  if (!payload.title) throw new Error('Title is required.');
  const { data, error } = await supabase.from('quizzes').insert(payload).select('*').single();
  if (error) throw new Error('Failed to create quiz.');
  return data;
}

// PUBLIC_INTERFACE
export async function createQuestions(quiz_id, questions = []) {
  /** Bulk insert quiz questions. Each question: { prompt, options: string[], correct_index, points } */
  if (!quiz_id) throw new Error('Quiz id is required.');
  const cleaned = (questions || [])
    .filter((q) => q && typeof q.prompt === 'string' && Array.isArray(q.options) && q.options.length >= 2)
    .map((q) => ({
      quiz_id,
      prompt: String(q.prompt).trim(),
      options: q.options,
      correct_index: Number.isInteger(q.correct_index) ? q.correct_index : 0,
      points: Number.isFinite(q.points) ? Math.max(0, Math.round(q.points)) : 1,
    }));
  if (cleaned.length === 0) return [];
  const { data, error } = await supabase.from('quiz_questions').insert(cleaned).select('*');
  if (error) throw new Error('Failed to add questions.');
  return data || [];
}

// PUBLIC_INTERFACE
export async function getQuestions(quiz_id) {
  /** List questions for a quiz */
  if (!quiz_id) throw new Error('Quiz id is required.');
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quiz_id)
    .order('id', { ascending: true });
  if (error) throw new Error('Failed to load questions.');
  return data || [];
}

// PUBLIC_INTERFACE
export async function recordAttempt({ quiz_id, user_id, answers, score, total_points }) {
  /**
   * Record an attempt for a quiz.
   * answers: array of { question_id, selected_index }
   */
  if (!quiz_id || !user_id) throw new Error('Invalid attempt data.');
  const payload = {
    quiz_id,
    user_id,
    answers: answers || [],
    score: Number.isFinite(score) ? Math.round(score) : 0,
    total_points: Number.isFinite(total_points) ? Math.round(total_points) : 0,
  };
  const { data, error } = await supabase.from('quiz_attempts').insert(payload).select('*').single();
  if (error) throw new Error('Failed to record attempt.');
  return data;
}

// PUBLIC_INTERFACE
export async function listAttempts(quiz_id, { user_id } = {}) {
  /** List attempts for a quiz; optionally filter by user */
  if (!quiz_id) throw new Error('Quiz id is required.');
  let query = supabase.from('quiz_attempts').select('*').eq('quiz_id', quiz_id).order('created_at', { ascending: false });
  if (user_id) query = query.eq('user_id', user_id);
  const { data, error } = await query;
  if (error) throw new Error('Failed to load attempts.');
  return data || [];
}

export default {
  listQuizzes,
  getQuizById,
  createQuiz,
  createQuestions,
  getQuestions,
  recordAttempt,
  listAttempts,
};
