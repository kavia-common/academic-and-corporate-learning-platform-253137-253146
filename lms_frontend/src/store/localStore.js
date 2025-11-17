import { courses as initialCourses, learningPath as initialLearningPath } from '../data/learningData';

// Key names for localStorage (stable)
const LS_KEYS = {
  courses: 'lms.courses',
  learningPaths: 'lms.learningPaths',
};

// Simple pub/sub for store updates (within-tab) + storage event (cross-tab)
const listeners = new Set();
/** Notify all subscribers about a change. */
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

function normalizeInitialLearningPathToArray() {
  // initialData exports a single learningPath object; normalize to array
  const arr = [];
  if (initialLearningPath) {
    // The public page expects fields: { id, title, description, cover, courses: [] }
    // Admin-managed learning paths use: { id, title, description, coverImage, courseIds: [] }
    // For merged list we retain the initial object as-is so public page can still show it
    arr.push(initialLearningPath);
  }
  return arr;
}

function getMergedLearningPaths() {
  const fromInitial = normalizeInitialLearningPathToArray();
  const overlay = readLocal(LS_KEYS.learningPaths);
  if (Array.isArray(overlay)) {
    // Overlay replaces/augments by id
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
export function getLearningPathById(id) {
  /** Retrieve a learning path by id from merged view. */
  return getMergedLearningPaths().find((p) => String(p.id) === String(id));
}

// PUBLIC_INTERFACE
export function addLearningPath(path) {
  /**
   * Add a new learning path. Normalized schema:
   * { id, title, description, coverImage, courseIds: string[] }
   */
  const existing = readLocal(LS_KEYS.learningPaths) || [];
  const id = path.id ?? generateId('path');
  const normalized = {
    id,
    title: path.title ?? path.name ?? '',
    description: path.description ?? '',
    coverImage: path.coverImage ?? path.image ?? '',
    courseIds: Array.isArray(path.courseIds) ? path.courseIds.map(String) : [],
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
    courseIds: Array.isArray(patch.courseIds)
      ? patch.courseIds.map(String)
      : Array.isArray(target.courseIds)
      ? target.courseIds.map(String)
      : [],
  };
  overById.set(String(id), updated);
  writeLocal(LS_KEYS.learningPaths, Array.from(overById.values()));
  emitChange('learningPaths');
  return updated;
}

// PUBLIC_INTERFACE
export function removeLearningPath(id) {
  /** Remove a learning path by id from localStorage overlay. */
  const over = readLocal(LS_KEYS.learningPaths) || [];
  const next = over.filter((p) => String(p.id) !== String(id));
  writeLocal(LS_KEYS.learningPaths, next);
  emitChange('learningPaths');
  return true;
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
   * Returns the default aggregated learning path used by the public page.
   * Priority: first admin-created learning path if present; otherwise the initial dataset.
   * If admin paths exist, we still return the first item from the merged array.
   * Public page expects shape of initialLearningPath (cover, courses, etc.). If an admin path
   * exists (without courses structure), we synthesize a minimal object that renders header/cover.
   */
  const all = getMergedLearningPaths();
  const first = all[0];
  if (!first) return null;

  // If it's the original seed with full courses structure, return as-is
  if (first.courses && Array.isArray(first.courses)) {
    return first;
  }

  // If it's an admin-created path (normalized schema), adapt minimally for display.
  // Note: We don't have detailed lessons per course for admin-created paths in this demo.
  return {
    id: first.id,
    title: first.title,
    description: first.description,
    cover: first.coverImage || first.cover,
    courses: [], // minimal empty courses array so UI renders gracefully
  };
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
