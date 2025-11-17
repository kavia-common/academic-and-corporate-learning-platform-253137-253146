//
// Learning Paths, Courses, and Lessons - Static In-Memory Data
// Apply minimal structures to support /paths, /paths/:pathId, /courses/:courseId routes.
// These structures are designed to be easily replaceable with API calls in the future.
//

// PUBLIC_INTERFACE
/**
 * Returns all learning paths.
 * Provides id, title, description, image.
 */
export const LEARNING_PATHS = [
  {
    id: "frontend-dev",
    title: "Frontend Development",
    description: "Master HTML, CSS, JavaScript and modern frameworks to build user interfaces.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "backend-dev",
    title: "Backend Development",
    description: "Learn server-side programming, databases, and API design.",
    image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "fullstack-js",
    title: "Fullstack JavaScript",
    description: "End-to-end development with Node.js and modern JS frameworks.",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "data-science",
    title: "Data Science & ML",
    description: "Statistics, Python, and machine learning for data-driven insights.",
    image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop"
  }
];

// PUBLIC_INTERFACE
/**
 * Returns all courses. Each course references a path by path_id.
 * Provides id, path_id, title, description, image.
 */
export const COURSES = [
  // Frontend
  {
    id: "react-101",
    path_id: "frontend-dev",
    title: "React for Beginners",
    description: "Learn components, hooks, and state management to build SPAs.",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "css-master",
    path_id: "frontend-dev",
    title: "Modern CSS Mastery",
    description: "Flexbox, Grid, animations, and responsive design patterns.",
    image: "https://images.unsplash.com/photo-1555421689-43cad7100751?q=80&w=1200&auto=format&fit=crop"
  },
  // Backend
  {
    id: "node-api",
    path_id: "backend-dev",
    title: "Node.js APIs with Express",
    description: "Build secure REST APIs with Express, JWT, and testing.",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "db-design",
    path_id: "backend-dev",
    title: "Database Design & SQL",
    description: "Relational modeling, normalization, and performant queries.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
  },
  // Fullstack
  {
    id: "mern-stack",
    path_id: "fullstack-js",
    title: "MERN Stack Essentials",
    description: "MongoDB, Express, React, and Node integration patterns.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "typescript-fullstack",
    path_id: "fullstack-js",
    title: "TypeScript for Fullstack",
    description: "Types across client and server for safer codebases.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
  },
  // Data
  {
    id: "python-ds",
    path_id: "data-science",
    title: "Python for Data Science",
    description: "NumPy, Pandas, and data wrangling workflows.",
    image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "ml-fundamentals",
    path_id: "data-science",
    title: "Machine Learning Fundamentals",
    description: "Supervised and unsupervised learning with scikit-learn.",
    image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=1200&auto=format&fit=crop"
  }
];

// PUBLIC_INTERFACE
/**
 * Sample lessons keyed by courseId. Currently only React course is populated.
 * Each lesson has id, title, type, and duration.
 */
export const LESSONS = {
  "react-101": [
    { id: "r1", title: "Introduction to React", type: "video", duration: "12:30" },
    { id: "r2", title: "JSX and Rendering", type: "reading", duration: "10:00" },
    { id: "r3", title: "State & Props Basics", type: "video", duration: "15:45" },
    { id: "r4", title: "Using Effects (useEffect)", type: "video", duration: "13:20" },
    { id: "r5", title: "Project: Build a Todo App", type: "project", duration: "—" }
  ]
};

// PUBLIC_INTERFACE
/**
 * Get courses belonging to a specific path id.
 * @param {string} pathId - The id of the learning path
 * @returns {Array} courses filtered by path_id
 */
export function getCoursesByPath(pathId) {
  return COURSES.filter(c => c.path_id === pathId);
}

// PUBLIC_INTERFACE
/**
 * Get a learning path by id.
 * @param {string} pathId - The id of the learning path
 * @returns {Object|undefined} the path object if found
 */
export function getPathById(pathId) {
  return LEARNING_PATHS.find(p => p.id === pathId);
}

// PUBLIC_INTERFACE
/**
 * Get a course by id.
 * @param {string} courseId - The id of the course
 * @returns {Object|undefined} the course object if found
 */
export function getCourseById(courseId) {
  return COURSES.find(c => c.id === courseId);
}

// PUBLIC_INTERFACE
/**
 * Get lessons for a course id.
 * @param {string} courseId - The course id
 * @returns {Array} lessons list or empty array
 */
export function getLessonsByCourse(courseId) {
  return LESSONS[courseId] || [];
}
