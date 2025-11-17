import React, { useMemo, useState } from 'react';
import { learningPath } from '../data/learningData';
import { Modal } from '../components/ui/Modal';
import { Card, CardBody, CardHeader } from '../components/ui/Card';


/**
 * PUBLIC_INTERFACE
 * LearningPath page renders the aggregated learningPath with course sections and playable lessons.
 * - Route: /learning-path
 * - Shows cover, title, description
 * - For each course in learningPath.courses, renders a grid of lesson cards
 * - Clicking a lesson opens a simple video player (iframe for Drive preview; fallback to native video)
 */
export default function LearningPath() {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  const path = learningPath;

  const onOpenLesson = (lesson) => {
    setActiveLesson(lesson);
    setPlayerOpen(true);
  };

  const onClose = () => {
    setPlayerOpen(false);
    setActiveLesson(null);
  };

  const player = useMemo(() => {
    if (!activeLesson) return null;
    const url = activeLesson.video_url;
    return (
      <video
        className="w-full rounded-md"
        src={url}
        controls
        playsInline
        aria-label={`Playing ${activeLesson.title}`}
      />
    );
  }, [activeLesson]);

  if (!path) {
    return (
      <div className="p-6">
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-gray-900">Learning Path</h2>
          <p className="text-gray-600 mt-2">Not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="card overflow-hidden shadow-sm rounded-lg bg-white">
        <div className="h-56 w-full overflow-hidden">
          <img
            src={path.cover}
            alt={path.title}
            className="w-full h-56 object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h1 className="text-2xl font-semibold text-gray-900">{path.title}</h1>
          <p className="text-gray-700 mt-2">{path.description}</p>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {Array.isArray(path.courses) &&
          path.courses.map((course) => (
            <Card key={course.key}>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                <div className="text-sm text-gray-500">
                  {Array.isArray(course.lessons) ? course.lessons.length : 0} lessons
                </div>
              </CardHeader>
              <CardBody>
                {Array.isArray(course.lessons) && course.lessons.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {course.lessons.map((lesson, idx) => (
                      <button
                        type="button"
                        key={`${course.key}_${idx}_${lesson.title}`}
                        className="text-left card bg-white rounded-lg border border-gray-200 hover:shadow transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => onOpenLesson(lesson)}
                        aria-label={`Open lesson ${lesson.title}`}
                      >
                        <div className="h-40 w-full overflow-hidden rounded-t-lg">
                          <img
                            src={lesson.thumbnail}
                            alt={lesson.title}
                            className="w-full h-40 object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <div className="font-medium text-gray-900">{lesson.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{lesson.duration}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No lessons available.</div>
                )}
              </CardBody>
            </Card>
          ))}
      </div>

      <Modal open={playerOpen} onClose={onClose} title={activeLesson?.title}>
        <div className="space-y-3">
          {player}
          {activeLesson?.duration && (
            <div className="text-sm text-gray-600">Duration: {activeLesson.duration}</div>
          )}
          <div className="flex justify-end">
            <button
              className="btn inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={onClose}
              aria-label="Close player"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
