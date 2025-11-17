import React from "react";
import { Link, useParams } from "react-router-dom";
import { getCourseById, getModulesByCourse } from "../data/learningData";

/**
 * CourseLessons page shows modules for a course. For course_id 102, example modules are shown.
 * URL: /courses/:courseId
 */
export default function CourseLessons() {
  const { courseId } = useParams();
  const course = getCourseById(courseId);
  const modules = getModulesByCourse(courseId);

  if (!course) {
    return (
      <div className="p-6">
        <div className="card p-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Course not found</h2>
          <p className="text-gray-600 mt-2">
            The course you are looking for does not exist.
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
          <h1 className="text-2xl font-semibold text-gray-800">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>
        <Link to={`/paths/${encodeURIComponent(course.path_id)}`} className="nav-link text-blue-600 hover:underline">
          Back to Path
        </Link>
      </div>

      <div className="card bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Modules</h2>
          {Number(courseId) !== 102 && modules.length === 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Sample modules are currently available for "React for Beginners" only (course 102).
            </p>
          )}
        </div>
        <ul className="divide-y">
          {modules.map((mod) => (
            <li key={mod.module_id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{mod.title}</p>
                <p className="text-sm text-gray-600">Type: {mod.type}</p>
              </div>
              <span className="text-sm text-gray-500">{mod.duration}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
