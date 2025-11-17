import { supabase } from './client';
import { safeExec, shapeError, validatePayload, buildRange } from './utils';

// PUBLIC_INTERFACE
/** Fetch quizzes optionally filtered by courseId. */
export async function fetchQuizzes(courseId, options = {}) {
  const { page = 1, pageSize = 100 } = options;
  const { from, to } = buildRange(page, pageSize);
  return safeExec(async () => {
    let query = supabase.from('quizzes').select('*').order('created_at', { ascending: false }).range(from, to);
    if (courseId && typeof courseId === 'object' && courseId !== null) {
      // support old signature listQuizzes({courseId})
      if (courseId.courseId) query = query.eq('course_id', courseId.courseId);
    } else if (courseId) {
      query = query.eq('course_id', courseId);
    }
    const { data, error } = await query;
    return { data, error };
  }, 'QUIZ_LIST_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Fetch a single quiz by id. */
export async function fetchQuizById(id) {
  if (!id) return shapeError(new Error('id is required'), 'VALIDATION_ERROR', 400);
  return safeExec(async () => {
    const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
    return { data, error };
  }, 'QUIZ_FETCH_FAILED', 404);
}

// PUBLIC_INTERFACE
/** Create a quiz. */
export async function createQuiz(quiz) {
  const required = { title: 'string' };
  const valid = validatePayload(required, quiz || {});
  if (!valid.ok) return valid;

  return safeExec(async () => {
    const { data, error } = await supabase.from('quizzes').insert(quiz).select().single();
    return { data, error };
  }, 'QUIZ_CREATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Bulk insert quiz questions. */
export async function createQuestions(quiz_id, questions = []) {
  if (!quiz_id) return shapeError(new Error('quiz_id is required'), 'VALIDATION_ERROR', 400);
  const cleaned = (questions || [])
    .filter((q) => q && typeof q.prompt === 'string' && Array.isArray(q.options) && q.options.length >= 2)
    .map((q) => ({
      quiz_id,
      prompt: String(q.prompt).trim(),
      options: q.options,
      correct_index: Number.isInteger(q.correct_index) ? q.correct_index : 0,
      points: Number.isFinite(q.points) ? Math.max(0, Math.round(q.points)) : 1,
    }));
  if (cleaned.length === 0) return { ok: true, data: [] };

  return safeExec(async () => {
    const { data, error } = await supabase.from('quiz_questions').insert(cleaned).select();
    return { data, error };
  }, 'QUESTIONS_CREATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** List questions for a quiz. */
export async function getQuestions(quiz_id) {
  if (!quiz_id) return shapeError(new Error('quiz_id is required'), 'VALIDATION_ERROR', 400);
  return safeExec(async () => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz_id)
      .order('id', { ascending: true });
    return { data, error };
  }, 'QUESTIONS_LIST_FAILED', 400);
}

// PUBLIC_INTERFACE
/** Record a quiz attempt. */
export async function recordAttempt({ quiz_id, user_id, answers, score, total_points }) {
  if (!quiz_id || !user_id) {
    return shapeError(new Error('quiz_id and user_id are required'), 'VALIDATION_ERROR', 400);
  }
  const payload = {
    quiz_id,
    user_id,
    answers: answers || [],
    score: Number.isFinite(score) ? Math.round(score) : 0,
    total_points: Number.isFinite(total_points) ? Math.round(total_points) : 0,
  };
  return safeExec(async () => {
    const { data, error } = await supabase.from('quiz_attempts').insert(payload).select().single();
    return { data, error };
  }, 'ATTEMPT_CREATE_FAILED', 400);
}

// PUBLIC_INTERFACE
/** List attempts for a quiz (optionally filtered by user). */
export async function listAttempts(quiz_id, { user_id } = {}) {
  if (!quiz_id) return shapeError(new Error('quiz_id is required'), 'VALIDATION_ERROR', 400);
  return safeExec(async () => {
    let query = supabase.from('quiz_attempts').select('*').eq('quiz_id', quiz_id).order('created_at', { ascending: false });
    if (user_id) query = query.eq('user_id', user_id);
    const { data, error } = await query;
    return { data, error };
  }, 'ATTEMPTS_LIST_FAILED', 400);
}

// Backward compatibility named exports used by pages in this repo
export const listQuizzes = async ({ courseId } = {}) => {
  const res = await fetchQuizzes(courseId ?? undefined);
  if (!res.ok) throw new Error(res.error?.message || 'Failed to load quizzes');
  return res.data;
};
export const getQuizById = async (id) => {
  const res = await fetchQuizById(id);
  if (!res.ok) throw new Error(res.error?.message || 'Quiz not found');
  return res.data;
};
