//
// Learning Paths, Courses, Modules, Skill Tags, and Difficulty Levels - Static In-Memory Data
// Supports /paths, /paths/:pathId, /courses/:courseId routes with expanded datasets.
//
// PUBLIC_INTERFACE
/**
 * Learning Paths dataset (10 items).
 * Fields:
 * - path_id: number
 * - title: string
 * - description: string
 * - image: string (url)
 */
export const LEARNING_PATHS = [
  { path_id: 1, title: "Frontend Development", description: "HTML, CSS, JS, and modern frameworks for UI engineering.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 2, title: "Backend Development", description: "Server-side programming, APIs, and databases.", image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 3, title: "DevOps & Cloud", description: "CI/CD, containers, cloud services and reliability.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 4, title: "Data Science & ML", description: "Statistics, Python, ML workflows and modeling.", image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 5, title: "Fullstack JavaScript", description: "End-to-end JS with Node and modern frontends.", image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 6, title: "Mobile Development", description: "Native and cross-platform mobile app development.", image: "https://images.unsplash.com/photo-1555421689-43cad7100751?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 7, title: "Cybersecurity", description: "Security principles, practices, and tooling.", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 8, title: "UI/UX Design", description: "Interaction design, prototyping, and usability.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 9, title: "Product Management", description: "Strategy, roadmaps, discovery, and delivery.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" },
  { path_id: 10, title: "Data Engineering", description: "ETL, warehousing, and big data pipelines.", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop" }
];

// PUBLIC_INTERFACE
/**
 * Courses dataset. Each course references a learning path by numeric path_id.
 * Required fields:
 * - course_id: number
 * - path_id: number
 * - title: string
 * - description: string
 * - difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
 * - skills: string[] (tags)
 * - image: string (url)
 *
 * Populated courses are provided for path_id 1, 2, and 5 to demonstrate per-path mapping.
 */
export const COURSES = [
  // Path 1 - Frontend Development
  { course_id: 101, path_id: 1, title: "HTML & CSS Foundations", description: "Semantic HTML, modern CSS layout (Flexbox/Grid), accessibility.", difficulty: "Beginner", skills: ["HTML", "CSS", "Accessibility"], image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200&auto=format&fit=crop" },
  { course_id: 102, path_id: 1, title: "React for Beginners", description: "Components, hooks, state management and routing for SPAs.", difficulty: "Beginner", skills: ["React", "JavaScript", "SPA"], image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop" },
  { course_id: 103, path_id: 1, title: "Advanced CSS & Animations", description: "Advanced responsive patterns, transitions, and animation libraries.", difficulty: "Intermediate", skills: ["CSS", "Animations", "Responsive"], image: "https://images.unsplash.com/photo-1555421689-43cad7100751?q=80&w=1200&auto=format&fit=crop" },

  // Path 2 - Backend Development
  { course_id: 201, path_id: 2, title: "Node.js APIs with Express", description: "REST design, middleware, auth, and testing for Node APIs.", difficulty: "Beginner", skills: ["Node.js", "Express", "REST"], image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop" },
  { course_id: 202, path_id: 2, title: "Relational Databases & SQL", description: "Modeling, normalization, indexing, and query optimization.", difficulty: "Intermediate", skills: ["SQL", "PostgreSQL", "DB Design"], image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" },
  { course_id: 203, path_id: 2, title: "Authentication & Authorization", description: "JWTs, sessions, RBAC, and secure API patterns.", difficulty: "Intermediate", skills: ["Auth", "JWT", "RBAC"], image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop" },

  // Path 5 - Fullstack JavaScript
  { course_id: 501, path_id: 5, title: "TypeScript Essentials", description: "Type system basics, generics, inference, and tooling.", difficulty: "Beginner", skills: ["TypeScript", "JavaScript"], image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop" },
  { course_id: 502, path_id: 5, title: "MERN Stack Integration", description: "MongoDB, Express, React, Node integration and patterns.", difficulty: "Intermediate", skills: ["MongoDB", "Express", "React", "Node"], image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop" },
  { course_id: 503, path_id: 5, title: "Fullstack Testing Strategies", description: "Unit, integration, e2e with Jest, Testing Library, Cypress.", difficulty: "Advanced", skills: ["Testing", "Jest", "Cypress"], image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=1200&auto=format&fit=crop" }
];

// PUBLIC_INTERFACE
/**
 * Example modules for a specific course: course_id 102 (React for Beginners).
 * Fields per module:
 * - module_id: number
 * - course_id: number
 * - title: string
 * - type: 'video' | 'reading' | 'project' | 'quiz'
 * - duration: string (e.g., '12:30' or '--' for NA)
 */
export const MODULES = [
  { module_id: 1, course_id: 102, title: "Introduction to React", type: "video", duration: "12:30" },
  { module_id: 2, course_id: 102, title: "JSX and Rendering", type: "reading", duration: "10:00" },
  { module_id: 3, course_id: 102, title: "State & Props Basics", type: "video", duration: "15:45" },
  { module_id: 4, course_id: 102, title: "Using Effects (useEffect)", type: "video", duration: "13:20" },
  { module_id: 5, course_id: 102, title: "Project: Build a Todo App", type: "project", duration: "--" }
];

// PUBLIC_INTERFACE
/** Skill tags catalog; optional for UI rendering and filtering. */
export const SKILL_TAGS = [
  "HTML", "CSS", "JavaScript", "React", "TypeScript", "Node.js", "Express",
  "REST", "SQL", "PostgreSQL", "DB Design", "Auth", "JWT", "RBAC",
  "MongoDB", "Animations", "Responsive", "Testing", "Cypress", "Accessibility", "SPA"
];

// PUBLIC_INTERFACE
/** Difficulty levels catalog for filter UI. */
export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

// PUBLIC_INTERFACE
/**
 * Get all courses belonging to a specific path (numeric).
 * @param {number} pathId - The numeric path_id of the learning path
 * @returns {Array} courses filtered by path_id
 */
export function getCoursesByPath(pathId) {
  const pid = Number(pathId);
  return COURSES.filter((c) => Number(c.path_id) === pid);
}

// PUBLIC_INTERFACE
/**
 * Get a learning path by id (accepts numeric string or number).
 * @param {number|string} pathId - path identifier
 * @returns {Object|undefined} the path object if found
 */
export function getPathById(pathId) {
  const pid = Number(pathId);
  return LEARNING_PATHS.find((p) => Number(p.path_id) === pid);
}

// PUBLIC_INTERFACE
/**
 * Get a course by id (accepts numeric string or number).
 * @param {number|string} courseId - The id of the course
 * @returns {Object|undefined} the course object if found
 */
export function getCourseById(courseId) {
  const cid = Number(courseId);
  return COURSES.find((c) => Number(c.course_id) === cid);
}

// PUBLIC_INTERFACE
/**
 * Get modules for a given course id (numeric). Falls back to empty array.
 * @param {number|string} courseId - The course id
 * @returns {Array} modules list or empty array
 */
export function getModulesByCourse(courseId) {
  const cid = Number(courseId);
  return MODULES.filter((m) => Number(m.course_id) === cid);
}
