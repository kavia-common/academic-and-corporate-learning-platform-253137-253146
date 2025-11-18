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

/**
 * PUBLIC_INTERFACE
 * App root component that sets up routing and the main application layout
 * with Ocean Professional visual style. Provides pages for Dashboard,
 * Courses, Users, Assignments, Progress, and Healthcheck. Adds Supabase Auth
 * with session persistence, protected routes, and auth pages.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/health" element={<Healthcheck />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />

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
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
