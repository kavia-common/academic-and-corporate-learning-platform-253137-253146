import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';
import { useAuth } from './auth/AuthProvider';

// Auth pages
import SignIn from './auth/pages/SignIn';
import SignUp from './auth/pages/SignUp';
import ResetPassword from './auth/pages/ResetPassword';
import VerifyEmail from './auth/pages/VerifyEmail';
import ProfilePage from './auth/pages/Profile';

// Courses
import CourseList from './courses/CourseList';
import CourseDetail from './courses/CourseDetail';
import CourseForm from './courses/CourseForm';
import CreateCourse from './courses/CreateCourse';
import AddVideo from './courses/AddVideo';

// Assignments
import AssignmentList from './assignments/AssignmentList';
import AssignmentDetail from './assignments/AssignmentDetail';
import AssignmentCreate from './assignments/AssignmentCreate';
import SubmissionList from './assignments/SubmissionList';

// Quizzes
import QuizList from './quizzes/QuizList';
import QuizCreate from './quizzes/QuizCreate';
import QuizDetail from './quizzes/QuizDetail';
import QuizTake from './quizzes/QuizTake';

// Dashboards
import AdminDashboard from './dashboards/AdminDashboard';

import StudentDashboard from './dashboards/StudentDashboard';

// PUBLIC_INTERFACE
export function HomePage() {
  /** Landing page showing any redirect notices. */
  const location = useLocation();
  const notice = location.state?.notice;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 className="text-2xl font-semibold">Welcome</h1>
      {notice ? (
        <p style={{ marginTop: 12, color: 'var(--color-muted)' }}>{notice}</p>
      ) : null}
      {/* Secondary navigation removed per UI cleanup requirements */}
    </div>
  );
}

// PUBLIC_INTERFACE
function RoleDashboardRouter() {
  /**
   * Routes authenticated users hitting /dashboard to their role-specific dashboard:
   * - admin -> /dashboard/admin
   * - instructor -> /dashboard/instructor
   * - student (default) -> /dashboard/student
   */
  const { role } = useAuth();
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/dashboard/student" replace />;
}

/**
 * PUBLIC_INTERFACE
 * ApplicationRoutes: central routing configuration using React Router v6,
 * including protected and role-based routes and Supabase auth pages.
 */
export default function ApplicationRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Auth pages */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Public course/quiz views */}
      <Route path="/courses" element={<CourseList />} />
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route path="/quizzes" element={<QuizList />} />
      <Route path="/quizzes/:id" element={<QuizDetail />} />
      <Route path="/quizzes/:id/take" element={<QuizTake />} />

      {/* Public/Contextual lists */}
      <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
      <Route path="/courses/:courseId/quizzes" element={<QuizList />} />
      <Route path="/assignments/:id" element={<AssignmentDetail />} />

      {/* Protected user routes */}
      <Route element={<ProtectedRoute />}>
        {/* Role-based dashboard landing */}
        <Route path="/dashboard" element={<RoleDashboardRouter />} />

        {/* Admin */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>



        {/* Student */}
        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/assignments" element={<AssignmentList />} />
        </Route>

        {/* Shared protected */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin management only */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/courses/new" element={<CourseForm />} />
          <Route path="/courses/create" element={<CreateCourse />} />
          <Route path="/courses/:id/edit" element={<CourseForm />} />
          <Route path="/courses/:courseId/assignments/new" element={<AssignmentCreate />} />
          <Route path="/assignments/:id/submissions" element={<SubmissionList />} />
          <Route path="/quizzes/new" element={<QuizCreate />} />
          <Route path="/courses/:courseId/quizzes/new" element={<QuizCreate />} />
          {/* Add Video flow for newly created course */}
          <Route path="/admin/courses/:courseId/add-video" element={<AddVideo />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
