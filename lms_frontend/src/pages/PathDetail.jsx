import React from "react";
import { Link, useParams } from "react-router-dom";
import { getPathById, getCoursesByPath } from "../data/learningData";

/**
 * PathDetail page shows a single learning path and its courses.
 * URL: /paths/:pathId
 */
export default function PathDetail() {
  const { pathId } = useParams();
  const path = getPathById(pathId);
  const courses = getCoursesByPath(pathId);

  if (!path) {
    return (
      <div className="p-6">
        <div className="card p-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Path not found</h2>
          <p className="text-gray-600 mt-2">
            The learning path you are looking for does not exist.
          </p>
          <div className="mt-4">
            <Link to="/paths" className="nav-link text-blue-600 hover:underline">
              Back to Paths
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{path.title}</h1>
          <p className="text-gray-600">{path.description}</p>
        </div>
        <Link to="/paths" className="nav-link text-blue-600 hover:underline">
          All Paths
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="card overflow-hidden shadow-sm rounded-lg bg-white">
            <div className="h-40 w-full overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
              <div className="mt-3 flex gap-2">
                <Link
                  to={`/courses/${encodeURIComponent(course.id)}`}
                  className="btn inline-flex items-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition"
                  aria-label={`View lessons in ${course.title}`}
                >
                  View Lessons
                </Link>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="card p-4 bg-white">
            <p className="text-gray-700">No courses found for this path yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
