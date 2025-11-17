import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listLearningPaths,
  getAllCourses,
  removeLearningPath,
  subscribe,
} from '../store/localStore';

export default function LearningPathsAdminList() {
  const [paths, setPaths] = useState(() => listLearningPaths());

  useEffect(() => {
    const unsub = subscribe(() => setPaths(listLearningPaths()));
    // ensure latest snapshot on mount
    setPaths(listLearningPaths());
    return () => unsub();
  }, []);

  const courseMap = useMemo(() => {
    const arr = getAllCourses();
    const map = new Map(arr.map((c) => [String(c.id), c]));
    return map;
  }, []);

  const onDelete = (id) => {
    // Basic confirm for demo
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this learning path?');
    if (!ok) return;
    removeLearningPath(id);
    // subscribe() will refresh, but we also optimistically update for snappier UI
    setPaths((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  return (
    <div className="ocean-container">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">Courses</h1>
        <span className="text-sm text-red-600">
          Demo-only admin (client-side). For production, wire to backend with auth.
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Link to="/admin/learning-paths/new" className="ocean-button btn">New Course</Link>
        <Link to="/learning-path" className="nav-link text-blue-600 hover:underline">View Public Course Page</Link>
      </div>
      <div className="ocean-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {paths.map((p) => (
          <div key={p.id} className="ocean-card p-4 card">
            <div className="flex items-center gap-3">
              {p.coverImage ? (
                <img src={p.coverImage} alt="" className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded" />
              )}
              <div>
                <h3 className="font-medium">{p.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                <p className="text-xs text-gray-500 mt-1">{Array.isArray(p.courseIds) ? p.courseIds.length : 0} courses</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <Link to={`/admin/learning-paths/${p.id}/edit`} className="text-blue-600 hover:underline nav-link">
                Edit
              </Link>
              <button
                type="button"
                className="text-red-600 hover:underline nav-link"
                onClick={() => onDelete(p.id)}
              >
                Delete
              </button>
            </div>
            {Array.isArray(p.courseIds) && p.courseIds.length > 0 && (
              <ul className="mt-2 text-sm list-disc list-inside text-gray-700">
                {p.courseIds.slice(0, 4).map((cid) => {
                  const c = courseMap.get(String(cid));
                  return <li key={cid}>{c?.title ?? cid}</li>;
                })}
                {p.courseIds.length > 4 && <li>+{p.courseIds.length - 4} more</li>}
              </ul>
            )}
          </div>
        ))}
        {paths.length === 0 && (
          <div className="ocean-card p-4">
            <p className="text-gray-600">No learning paths yet. Create the first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
