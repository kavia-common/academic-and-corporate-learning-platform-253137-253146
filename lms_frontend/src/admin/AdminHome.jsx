import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  return (
    <div className="ocean-container">
      <div className="ocean-card p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <span className="text-sm text-red-600">
            Demo-only admin (client-side). For production, wire to backend with auth.
          </span>
        </div>
        <p className="mt-2 text-gray-600">
          Manage courses and learning paths for this demo session. Changes persist in your browser only.
        </p>
        <div className="mt-6 ocean-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/admin/courses" className="ocean-card p-4 hover:shadow-md transition card nav-link block">
            <h2 className="font-medium text-lg">Manage Courses</h2>
            <p className="text-sm text-gray-600 mt-1">Create and edit courses.</p>
          </Link>
          <Link to="/admin/learning-paths" className="ocean-card p-4 hover:shadow-md transition card nav-link block">
            <h2 className="font-medium text-lg">Manage Learning Paths</h2>
            <p className="text-sm text-gray-600 mt-1">Create and edit learning paths.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
