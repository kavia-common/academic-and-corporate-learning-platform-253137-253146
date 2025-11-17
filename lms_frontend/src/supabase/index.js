export { supabase } from './client';

// Users and Auth helpers
export {
  createUser,
  getUserById,
  getUserByEmail,
  listUsers,
  updateUser,
  deleteUser,
  updatePassword,
  getCurrentAuthUser,
  getAdminCounts,
  listRecentItems,
} from './supabaseUsers';

// Courses
export {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
} from './supabaseCourses';

// Assignments
export {
  fetchAssignments,
  fetchAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  listSubmissions,
} from './supabaseAssignments';

// Quizzes
export {
  fetchQuizzes,
  fetchQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestions,
  getQuizById,
  getQuestions,
  listAttempts,
  listQuizzes,
} from './supabaseQuizzes';

// Storage
export {
  uploadFile,
  getPublicUrl,
  createSignedUrl,
  removeFiles,
  listFiles,
} from './supabaseStorage';
