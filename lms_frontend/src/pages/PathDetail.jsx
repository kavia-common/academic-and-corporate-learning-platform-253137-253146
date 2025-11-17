import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPathById, getCoursesByPath, DIFFICULTY_LEVELS } from "../data/learningData";

/**
 * PathDetail page shows a single learning path and its courses.
 * URL: /paths/:pathId
 */
export default function PathDetail() {
  const { pathId } = useParams();
  const path = getPathById(pathId);
  const [difficulty, setDifficulty] = useState("All");

  const allCourses = getCoursesByPath(pathId);
  const courses = useMemo(() => {
    if (difficulty === "All") return allCourses;
    return allCourses.filter((c) => String(c.difficulty) === difficulty);
  }, [allCourses, difficulty]);

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

      {/* Difficulty filter chip group */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`px-3 py-1 rounded-full border ${difficulty === "All" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"}`}
          onClick={() => setDifficulty("All")}
        >
          All
        </button>
        {DIFFICULTY_LEVELS.map((lvl) => (
          <button
            key={lvl}
            type="button"
            className={`px-3 py-1 rounded-full border ${difficulty === lvl ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"}`}
            onClick={() => setDifficulty(lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.course_id} className="card overflow-hidden shadow-sm rounded-lg bg-white">
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

              {/* Optional skill tags */}
              {Array.isArray(course.skills) && course.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {course.skills.map((tag) => (
                    <span key={tag} className="inline-block text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex gap-2 items-center">
                <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {course.difficulty}
                </span>
                <Link
                  to={`/courses/${encodeURIComponent(course.course_id)}`}
                  className="btn inline-flex items-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition ml-auto"
                  aria-label={`View modules in ${course.title}`}
                >
                  View Modules
                </Link>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="card p-4 bg-white">
            <p className="text-gray-700">No courses found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
