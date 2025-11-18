import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Users from './pages/Users';
import Assignments from './pages/Assignments';
import Progress from './pages/Progress';
import Healthcheck from './pages/Healthcheck';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import MagicLink from './pages/auth/MagicLink';
import ResetRequest from './pages/auth/ResetRequest';
import ResetUpdate from './pages/auth/ResetUpdate';
import CourseDetail from './pages/CourseDetail';
import AssignmentDetail from './pages/AssignmentDetail';
import MyProgress from './pages/MyProgress';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast/ToastProvider';

/**
 * PUBLIC_INTERFACE
 * App root component that sets up routing and the main application layout
 * with Ocean Professional visual style. Provides pages for Dashboard,
 * Courses, Users, Assignments, Progress, and Healthcheck. Adds Supabase Auth
 * with session persistence, protected routes, magic link and password reset routes.
 * New protected routes:
 * - /courses/:id (Course detail with tabs)
 * - /assignments/:id (Assignment detail & submissions)
 * - /me/progress (My progress view)
 * Public auth routes:
 * - /auth/magic (send magic link)
 * - /auth/reset (password update via recovery hash)
 * - /auth/reset/request (request reset email)
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <AppLayout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/health" element={<Healthcheck />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/magic" element={<MagicLink />} />
                <Route path="/auth/reset/request" element={<ResetRequest />} />
                <Route path="/auth/reset" element={<ResetUpdate />} />

                {/* Protected routes */}
                <Route
                  path="/courses"
                  element={
                    <ProtectedRoute>
                      <Courses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:id"
                  element={
                    <ProtectedRoute>
                      <CourseDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assignments"
                  element={
                    <ProtectedRoute>
                      <Assignments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assignments/:id"
                  element={
                    <ProtectedRoute>
                      <AssignmentDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/progress"
                  element={
                    <ProtectedRoute>
                      <Progress />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/me/progress"
                  element={
                    <ProtectedRoute>
                      <MyProgress />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
