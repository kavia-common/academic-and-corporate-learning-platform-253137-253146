import { courses as initialCourses, learningPath as initialLearningPath } from '../data/learningData';

// Key names for localStorage
const LS_KEYS = {
  courses: 'lms.courses',
  learningPaths: 'lms.learningPaths',
};

// Simple pub/sub for store updates (within-tab) + storage event (cross-tab)
const listeners = new Set();
function emitChange(type) {
  listeners.forEach((cb) => {
    try {
      cb(type);
    } catch {
      // ignore listener errors
    }
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEYS.courses) emitChange('courses');
    if (e.key === LS_KEYS.learningPaths) emitChange('learningPaths');
  });
}

// Utility to safely parse JSON from localStorage
function readLocal(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Utility to write JSON to localStorage
function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op for storage quota errors in demo
  }
}

// Merge initial in-memory data with localStorage overlays
function getMergedCourses() {
  const fromInitial = Array.isArray(initialCourses) ? initialCourses : [];
  const overlay = readLocal(LS_KEYS.courses);
  if (Array.isArray(overlay)) {
    // overlay new/updated courses by id, keep others
    const byId = new Map(fromInitial.map((c) => [String(c.id), c]));
    overlay.forEach((c) => {
      byId.set(String(c.id), c);
    });
    return Array.from(byId.values());
  }
  return fromInitial;
}

function getMergedLearningPaths() {
  // initialData may have a single learningPath or an array; normalize to array
  let fromInitial = [];
  // Current dataset exports a single learningPath object; normalize to array
  if (initialLearningPath) {
    fromInitial = [initialLearningPath];
  }
  const overlay = readLocal(LS_KEYS.learningPaths);
  if (Array.isArray(overlay)) {
    const byId = new Map(fromInitial.map((p) => [String(p.id), p]));
    overlay.forEach((p) => {
      byId.set(String(p.id), p);
    });
    return Array.from(byId.values());
  }
  return fromInitial;
}

// Helpers to generate a client-side ID
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// PUBLIC_INTERFACE
export function getAllCourses() {
  /** Get all courses merged from initial data and localStorage overlay. */
  return getMergedCourses();
}

// PUBLIC_INTERFACE
export function listCourses() {
  /** Alias for getAllCourses for selector naming consistency. */
  return getMergedCourses();
}

// PUBLIC_INTERFACE
export function getCourseById(id) {
  /** Retrieve a course by id from merged view (initial + overlay). */
  const cid = String(id);
  return getMergedCourses().find((c) => String(c.id) === cid);
}

// PUBLIC_INTERFACE
export function addCourse(course) {
  /** Add a new course to localStorage overlay. Required: title, description, image */
  const existing = readLocal(LS_KEYS.courses) || [];
  const id = course.id ?? generateId('course');
  const newCourse = { id, ...course };
  writeLocal(LS_KEYS.courses, [...existing, newCourse]);
  emitChange('courses');
  return newCourse;
}

// PUBLIC_INTERFACE
export function updateCourse(id, patch) {
  /** Update a course by id in localStorage overlay. */
  const currentMerged = getMergedCourses();
  const target = currentMerged.find((c) => String(c.id) === String(id));
  if (!target) return null;

  const over = readLocal(LS_KEYS.courses) || [];
  const overById = new Map(over.map((c) => [String(c.id), c]));
  const updated = { ...target, ...patch, id: target.id };

  // ensure overlay contains updated version
  overById.set(String(id), updated);
  writeLocal(LS_KEYS.courses, Array.from(overById.values()));
  emitChange('courses');
  return updated;
}

// PUBLIC_INTERFACE
export function getAllLearningPaths() {
  /** Get all learning paths merged from initial data and localStorage overlay. */
  return getMergedLearningPaths();
}

// PUBLIC_INTERFACE
export function listLearningPaths() {
  /** Alias for getAllLearningPaths. */
  return getMergedLearningPaths();
}

// PUBLIC_INTERFACE
export function addLearningPath(path) {
  /** Add a new learning path. Fields: title/name, description, coverImage, courseIds[] */
  const existing = readLocal(LS_KEYS.learningPaths) || [];
  const id = path.id ?? generateId('path');
  const normalized = {
    id,
    title: path.title ?? path.name ?? '',
    description: path.description ?? '',
    coverImage: path.coverImage ?? path.image ?? '',
    courseIds: Array.isArray(path.courseIds) ? path.courseIds : [],
  };
  writeLocal(LS_KEYS.learningPaths, [...existing, normalized]);
  emitChange('learningPaths');
  return normalized;
}

// PUBLIC_INTERFACE
export function updateLearningPath(id, patch) {
  /** Update a learning path by id in localStorage overlay. */
  const currentMerged = getMergedLearningPaths();
  const target = currentMerged.find((p) => String(p.id) === String(id));
  if (!target) return null;

  const over = readLocal(LS_KEYS.learningPaths) || [];
  const overById = new Map(over.map((p) => [String(p.id), p]));
  const updated = {
    ...target,
    ...patch,
    id: target.id,
    title: patch.title ?? patch.name ?? target.title,
    coverImage: patch.coverImage ?? patch.image ?? target.coverImage,
    courseIds: Array.isArray(patch.courseIds) ? patch.courseIds : target.courseIds,
  };
  overById.set(String(id), updated);
  writeLocal(LS_KEYS.learningPaths, Array.from(overById.values()));
  emitChange('learningPaths');
  return updated;
}

// PUBLIC_INTERFACE
export function getLearningPathByIdOrDefault(id) {
  /**
   * Retrieve a learning path by id or fall back to the initial aggregated path if present.
   * If id is falsy, returns the first path available.
   */
  const all = getMergedLearningPaths();
  if (!id) return all[0];
  const found = all.find((p) => String(p.id) === String(id));
  return found || all[0];
}

// PUBLIC_INTERFACE
export function getAggregatedLearningPath() {
  /**
   * Returns the default aggregated learning path (first available).
   * This mirrors earlier usage of a single exported learningPath object.
   */
  return getLearningPathByIdOrDefault(null);
}

// PUBLIC_INTERFACE
export function subscribe(callback) {
  /**
   * Subscribe to store update notifications (in-tab). Also receives cross-tab updates via storage events.
   * Returns an unsubscribe function.
   */
  listeners.add(callback);
  return () => listeners.delete(callback);
}
