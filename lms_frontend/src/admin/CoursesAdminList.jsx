import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../store/localStore';

export default function CoursesAdminList() {
  const courses = useMemo(() => getAllCourses(), []);

  return (
    <div className="ocean-container">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">Learning Paths</h1>
        <span className="text-sm text-red-600">
          Demo-only admin (client-side). For production, wire to backend with auth.
        </span>
      </div>
      <div className="mt-4">
        <Link to="/admin/courses/new" className="ocean-button btn">New Learning Path</Link>
      </div>
      <div className="ocean-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {courses.map((c) => (
          <div key={c.id} className="ocean-card p-4 card">
            <div className="flex items-center gap-3">
              {c.image ? (
                <img src={c.image} alt="" className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded" />
              )}
              <div>
                <h3 className="font-medium">{c.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
              </div>
            </div>
            <div className="mt-3">
              <Link to={`/admin/courses/${c.id}/edit`} className="text-blue-600 hover:underline nav-link">
                Edit
              </Link>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="ocean-card p-4">
            <p className="text-gray-600">No learning paths yet. Create the first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
