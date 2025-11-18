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

/**
 * PUBLIC_INTERFACE
 * App root component that sets up routing and the main application layout
 * with Ocean Professional visual style. Provides pages for Dashboard,
 * Courses, Users, Assignments, Progress, and Healthcheck.
 */
function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/users" element={<Users />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/health" element={<Healthcheck />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
