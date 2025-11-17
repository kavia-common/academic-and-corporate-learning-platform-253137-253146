import React from "react";
import { Link } from "react-router-dom";
import { courses } from "../data/learningData";

/**
 * Courses page lists all items (formerly learning paths) with image, title, and description.
 * Uses Ocean Professional theme-like classes (card, btn, nav-link).
 */
export default function Paths() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Courses</h1>
        <Link to="/" className="nav-link text-blue-600 hover:underline">
          Home
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((item) => (
          <div key={item.id} className="card overflow-hidden shadow-sm rounded-lg bg-white">
            <div className="h-40 w-full overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              <div className="mt-3">
                <Link
                  to={`/courses/${encodeURIComponent(item.id)}`}
                  className="btn inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  aria-label={`View course ${item.title}`}
                >
                  View Course
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
