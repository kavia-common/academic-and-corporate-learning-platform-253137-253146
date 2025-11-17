import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/ui/Modal';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { getAggregatedLearningPath, subscribe } from '../store/localStore';

/**
 * PUBLIC_INTERFACE
 * LearningPath page renders the aggregated learningPath with course sections and playable lessons.
 * - Route: /learning-path
 * - Shows cover, title, description
 * - For each course in learningPath.courses, renders a grid of lesson cards
 * - Clicking a lesson opens a simple video player
 * - Ocean Professional theme applied via ocean-* classes with accessible focus states
 */
export default function LearningPath() {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [path, setPath] = useState(() => getAggregatedLearningPath());

  useEffect(() => {
    const refresh = () => setPath(getAggregatedLearningPath());
    const unsub = subscribe(refresh);
    refresh();
    return () => unsub();
  }, []);

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
    // Use the exact provided video_url with no transformation or fallback.
    const url = activeLesson?.video_url || '';
    return (
      <div className="ocean-video">
        <video
          className="w-full rounded-md"
          src={url}
          controls
          playsInline
          aria-label={`Playing ${activeLesson.title}`}
        />
      </div>
    );
  }, [activeLesson]);

  if (!path) {
    return (
      <div className="ocean-container">
        <div className="card ocean-card">
          <div className="ocean-card__body">
            <h2 className="ocean-title text-lg">Course</h2>
            <p className="ocean-muted mt-2">Not available.</p>
          </div>
        </div>
      </div>
    );
  }

  const coverUrl = path.cover || path.coverImage;

  return (
    <div className="ocean-bg">
      <header className="ocean-header ocean-container" role="banner">
        <div className="ocean-ribbon" aria-hidden="true"></div>
        <h1 className="ocean-title"> {path.title || 'Course'} </h1>
        {path.description && (
          <p className="ocean-muted">{path.description}</p>
        )}
      </header>

      <div className="ocean-container ocean-section">
        {/* Cover card */}
        {coverUrl && (
          <div className="card ocean-card overflow-hidden">
            <div className="w-full overflow-hidden">
              <img
                src={coverUrl}
                alt={path.title}
                className="ocean-thumb"
                loading="lazy"
              />
            </div>
            <div className="ocean-card__body">
              <h2 className="ocean-title text-xl">{path.title}</h2>
              {path.description && (
                <p className="ocean-muted mt-2">{path.description}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-8">
          {Array.isArray(path.courses) &&
            path.courses.map((course) => (
              <Card key={course.key} className="ocean-card">
                <CardHeader className="flex items-center justify-between">
                  <h2 className="ocean-title text-xl">{course.title}</h2>
                  <div className="text-sm">
                    <span className="ocean-badge" aria-label={`${Array.isArray(course.lessons) ? course.lessons.length : 0} lessons`}>
                      {Array.isArray(course.lessons) ? course.lessons.length : 0} lessons
                    </span>
                  </div>
                </CardHeader>
                <CardBody>
                  {Array.isArray(course.lessons) && course.lessons.length > 0 ? (
                    <div className="ocean-grid">
                      {course.lessons.map((lesson, idx) => (
                        <button
                          type="button"
                          key={`${course.key}_${idx}_${lesson.title}`}
                          className="text-left card ocean-card hover:shadow transition ocean-focusable focus:outline-none"
                          onClick={() => onOpenLesson(lesson)}
                          aria-label={`Open lesson ${lesson.title}`}
                        >
                          <div className="w-full overflow-hidden">
                            <img
                              src={lesson.thumbnail}
                              alt={lesson.title}
                              className="ocean-thumb"
                              loading="lazy"
                            />
                          </div>
                          <div className="ocean-card__body">
                            <div className="ocean-title text-base">{lesson.title}</div>
                            {lesson.duration && (
                              <div className="ocean-muted text-sm mt-1">{lesson.duration}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="ocean-muted text-sm">No lessons available.</div>
                  )}
                </CardBody>
              </Card>
            ))}
        </div>
      </div>

      <Modal open={playerOpen} onClose={onClose} title={activeLesson?.title}>
        <div className="space-y-3">
          {player}
          {activeLesson?.duration && (
            <div className="ocean-muted text-sm">Duration: {activeLesson.duration}</div>
          )}
          <div className="flex justify-end">
            <button
              className="btn ocean-button ocean-focusable"
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
