import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourseById as storeGetCourseById, subscribe } from "../store/localStore";

/**
 * Course Detail page shows a single Course (formerly path): image, title, description.
 * URL: /courses/:id
 */
export default function PathDetail() {
  const { pathId, id } = useParams();
  // Allow backward compatibility if route still uses :pathId temporarily
  const effectiveId = id ?? pathId;
  const [course, setCourse] = useState(() => storeGetCourseById(effectiveId));

  useEffect(() => {
    // Refresh when id changes or store updates
    function refresh() {
      setCourse(storeGetCourseById(effectiveId));
    }
    const unsub = subscribe(refresh);
    refresh();
    return () => unsub();
  }, [effectiveId]);

  if (!course) {
    return (
      <div className="p-6">
        <div className="card p-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Course not found</h2>
          <p className="text-gray-600 mt-2">
            The course you are looking for does not exist.
          </p>
          <div className="mt-4">
            <Link to="/courses" className="nav-link text-blue-600 hover:underline">
              Back to Courses
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
        <Link to="/courses" className="nav-link text-blue-600 hover:underline">
          All Courses
        </Link>
      </div>

      <div className="card overflow-hidden shadow-sm rounded-lg bg-white">
        <div className="h-64 w-full overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-64 object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
          <p className="text-gray-700 mt-2">{course.description}</p>
        </div>
      </div>
    </div>
  );
}
