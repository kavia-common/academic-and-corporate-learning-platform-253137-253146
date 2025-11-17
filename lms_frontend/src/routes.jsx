import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';
import { useAuth } from './auth/AuthProvider';
import SignIn from './auth/pages/SignIn';
import SignUp from './auth/pages/SignUp';
import ResetPassword from './auth/pages/ResetPassword';
import VerifyEmail from './auth/pages/VerifyEmail';
import CourseList from './courses/CourseList';
import CourseDetail from './courses/CourseDetail';
import CourseForm from './courses/CourseForm';
import AssignmentList from './assignments/AssignmentList';
import AssignmentDetail from './assignments/AssignmentDetail';
import AssignmentCreate from './assignments/AssignmentCreate';
import SubmissionList from './assignments/SubmissionList';
import QuizList from './quizzes/QuizList';
import QuizCreate from './quizzes/QuizCreate';
import QuizDetail from './quizzes/QuizDetail';
import QuizTake from './quizzes/QuizTake';
import ProfilePage from './auth/pages/Profile';
import AdminDashboard from './dashboards/AdminDashboard';
import InstructorDashboard from './dashboards/InstructorDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

// PUBLIC_INTERFACE
export function HomePage() {
  /** Landing page showing any redirect notices. */
  const location = useLocation();
  const notice = location.state?.notice;

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-semibold">Home</h1>
      {notice ? (
        <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>{notice}</p>
      ) : null}
      <nav style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link className="link" to="/dashboard">Dashboard</Link>
        <Link className="link" to="/admin">Admin</Link>
        <Link className="link" to="/instructor">Instructor</Link>
        <Link className="link" to="/courses">Courses</Link>
        <Link className="link" to="/quizzes">Quizzes</Link>
        <Link className="link" to="/login">Sign in</Link>
        <Link className="link" to="/signup">Sign up</Link>
      </nav>
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
  if (r === 'instructor') return <Navigate to="/dashboard/instructor" replace />;
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

      {/* Public courses list and detail (viewable by all), edit/create protected */}
      <Route path="/courses" element={<CourseList />} />
      <Route path="/courses/:id" element={<CourseDetail />} />

      {/* Public/Contextual assignment lists and detail */}
      {/* List assignments for a specific course (public view) */}
      <Route path="/courses/:courseId/assignments" element={<AssignmentList />} />
      {/* Assignment detail (public view), submission gated in component by role */}
      <Route path="/assignments/:id" element={<AssignmentDetail />} />

      {/* Public/Contextual quizzes */}
      <Route path="/quizzes" element={<QuizList />} />
      <Route path="/courses/:courseId/quizzes" element={<QuizList />} />
      <Route path="/quizzes/:id" element={<QuizDetail />} />
      <Route path="/quizzes/:id/take" element={<QuizTake />} />

      {/* Protected user routes */}
      <Route element={<ProtectedRoute />}>
        {/* Role-based dashboard landing */}
        <Route path="/dashboard" element={<RoleDashboardRouter />} />

        {/* Explicit dashboards by role */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['instructor']} />}>
          <Route path="/dashboard/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['student']} />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/assignments" element={<AssignmentList />} />
        </Route>

        {/* Shared protected routes */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Instructor/admin: create/edit courses and manage assignments */}
        <Route element={<RoleRoute allowedRoles={['instructor', 'admin']} />} >
          <Route path="/courses/new" element={<CourseForm />} />
          <Route path="/courses/:id/edit" element={<CourseForm />} />

          {/* Create assignment under a course */}
          <Route path="/courses/:courseId/assignments/new" element={<AssignmentCreate />} />
          {/* View submissions for an assignment */}
          <Route path="/assignments/:id/submissions" element={<SubmissionList />} />

          {/* Quizzes create */}
          <Route path="/quizzes/new" element={<QuizCreate />} />
          <Route path="/courses/:courseId/quizzes/new" element={<QuizCreate />} />
        </Route>
      </Route>

      {/* Fallback to Home for unknown routes */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
