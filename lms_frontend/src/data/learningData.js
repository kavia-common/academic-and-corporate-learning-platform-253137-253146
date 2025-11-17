/**
 * Static in-memory dataset for Courses (formerly Learning Paths).
 *
 * PUBLIC_INTERFACE
 * - Exported collection: courses
 * - Each item fields:
 *   - id: number (normalized from previous path_id)
 *   - title: string
 *   - description: string
 *   - image: string (url)
 */
export const courses = [
  { id: 1, title: "Frontend Development", description: "HTML, CSS, JS, and modern frameworks for UI engineering.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop" },
  { id: 2, title: "Backend Development", description: "Server-side programming, APIs, and databases.", image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop" },
  { id: 3, title: "DevOps & Cloud", description: "CI/CD, containers, cloud services and reliability.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop" },
  { id: 4, title: "Data Science & ML", description: "Statistics, Python, ML workflows and modeling.", image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop" },
  { id: 5, title: "Fullstack JavaScript", description: "End-to-end JS with Node and modern frontends.", image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop" },
  { id: 6, title: "Mobile Development", description: "Native and cross-platform mobile app development.", image: "https://images.unsplash.com/photo-1555421689-43cad7100751?q=80&w=1200&auto=format&fit=crop" },
  { id: 7, title: "Cybersecurity", description: "Security principles, practices, and tooling.", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=1200&auto=format&fit=crop" },
  { id: 8, title: "UI/UX Design", description: "Interaction design, prototyping, and usability.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop" },
  { id: 9, title: "Product Management", description: "Strategy, roadmaps, discovery, and delivery.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" },
  { id: 10, title: "Data Engineering", description: "ETL, warehousing, and big data pipelines.", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop" }
];

/**
 * PUBLIC_INTERFACE
 * Get a course (formerly path) by id (numeric string or number).
 * @param {number|string} id - item identifier
 * @returns {Object|undefined} the item if found
 */
export function getCourseById(id) {
  const cid = Number(id);
  return courses.find((p) => Number(p.id) === cid);
}

/**
 * PUBLIC_INTERFACE
 * Optional Skill tags catalog; retained if referenced elsewhere.
 */
export const SKILL_TAGS = [
  "HTML", "CSS", "JavaScript", "React", "TypeScript", "Node.js", "Express",
  "REST", "SQL", "PostgreSQL", "DB Design", "Auth", "JWT", "RBAC",
  "MongoDB", "Animations", "Responsive", "Testing", "Cypress", "Accessibility", "SPA"
];

/**
 * PUBLIC_INTERFACE
 * learningPath: Aggregated Full Web Development Learning Path with all included course groups and their lessons.
 * NOTE: Populate lessons arrays with the provided datasets (React, JavaScript, HTML, CSS, Python, Django, SQL).
 * Each lesson object shape:
 *   { title, thumbnail, duration, video_url, course_id }
 */
/**
 * PUBLIC_INTERFACE
 * learningPath: Aggregated Full Web Development Learning Path.
 * Each course contains a lessons array with items that MUST preserve field names exactly:
 *   - course_id
 *   - title
 *   - thumbnail
 *   - duration
 *   - video_url
 * Do not alter, filter, or transform the provided lesson data.
 */
export const learningPath = {
  id: 'full_web_dev',
  title: 'Full Web Development Learning Path',
  description:
    'A comprehensive sequence combining React, JavaScript, HTML, CSS, Python, Django, and SQL lessons in one guided path.',
  cover:
    'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1600&auto=format&fit=crop',
  courses: [
    {
      key: 'course_react',
      title: 'React',
      lessons: [
        { course_id: 'course_react', title: 'Intro to React', thumbnail: '/assets/react/intro.jpg', duration: '08:12', video_url: 'https://example.com/videos/react-intro.mp4' },
        { course_id: 'course_react', title: 'JSX and Rendering', thumbnail: '/assets/react/jsx.jpg', duration: '12:30', video_url: 'https://example.com/videos/react-jsx.mp4' },
        { course_id: 'course_react', title: 'State and Props', thumbnail: '/assets/react/state-props.jpg', duration: '15:45', video_url: 'https://example.com/videos/react-state-props.mp4' },
        { course_id: 'course_react', title: 'Hooks Overview', thumbnail: '/assets/react/hooks.jpg', duration: '18:05', video_url: 'https://example.com/videos/react-hooks.mp4' }
      ],
    },
    {
      key: 'course_js',
      title: 'JavaScript',
      lessons: [
        { course_id: 'course_js', title: 'JavaScript Basics', thumbnail: '/assets/js/basics.jpg', duration: '10:22', video_url: 'https://example.com/videos/js-basics.mp4' },
        { course_id: 'course_js', title: 'ES6+ Features', thumbnail: '/assets/js/es6.jpg', duration: '14:10', video_url: 'https://example.com/videos/js-es6.mp4' },
        { course_id: 'course_js', title: 'Asynchronous JS', thumbnail: '/assets/js/async.jpg', duration: '16:40', video_url: 'https://example.com/videos/js-async.mp4' },
        { course_id: 'course_js', title: 'Modules and Bundling', thumbnail: '/assets/js/modules.jpg', duration: '11:55', video_url: 'https://example.com/videos/js-modules.mp4' }
      ],
    },
    {
      key: 'course_html',
      title: 'HTML',
      lessons: [
        { course_id: 'course_html', title: 'HTML Structure', thumbnail: '/assets/html/structure.jpg', duration: '09:00', video_url: 'https://example.com/videos/html-structure.mp4' },
        { course_id: 'course_html', title: 'Forms and Inputs', thumbnail: '/assets/html/forms.jpg', duration: '13:25', video_url: 'https://example.com/videos/html-forms.mp4' },
        { course_id: 'course_html', title: 'Semantic Elements', thumbnail: '/assets/html/semantic.jpg', duration: '12:05', video_url: 'https://example.com/videos/html-semantic.mp4' }
      ],
    },
    {
      key: 'course_css',
      title: 'CSS',
      lessons: [
        { course_id: 'course_css', title: 'Selectors and Specificity', thumbnail: '/assets/css/selectors.jpg', duration: '10:10', video_url: 'https://example.com/videos/css-selectors.mp4' },
        { course_id: 'course_css', title: 'Flexbox and Grid', thumbnail: '/assets/css/layout.jpg', duration: '17:32', video_url: 'https://example.com/videos/css-layout.mp4' },
        { course_id: 'course_css', title: 'Responsive Design', thumbnail: '/assets/css/responsive.jpg', duration: '13:48', video_url: 'https://example.com/videos/css-responsive.mp4' }
      ],
    },
    {
      key: 'course_python',
      title: 'Python',
      lessons: [
        { course_id: 'course_python', title: 'Getting Started with Python', thumbnail: '/assets/python/start.jpg', duration: '11:20', video_url: 'https://example.com/videos/python-start.mp4' },
        { course_id: 'course_python', title: 'Data Types and Structures', thumbnail: '/assets/python/datatypes.jpg', duration: '15:05', video_url: 'https://example.com/videos/python-datatypes.mp4' },
        { course_id: 'course_python', title: 'Functions and Modules', thumbnail: '/assets/python/functions.jpg', duration: '14:42', video_url: 'https://example.com/videos/python-functions.mp4' }
      ],
    },
    {
      key: 'course_django',
      title: 'Django',
      lessons: [
        { course_id: 'course_django', title: 'Django Project Setup', thumbnail: '/assets/django/setup.jpg', duration: '12:00', video_url: 'https://example.com/videos/django-setup.mp4' },
        { course_id: 'course_django', title: 'Models and ORM', thumbnail: '/assets/django/models.jpg', duration: '16:15', video_url: 'https://example.com/videos/django-models.mp4' },
        { course_id: 'course_django', title: 'Views and Templates', thumbnail: '/assets/django/views.jpg', duration: '18:10', video_url: 'https://example.com/videos/django-views.mp4' }
      ],
    },
    {
      key: 'course_sql',
      title: 'SQL',
      lessons: [
        { course_id: 'course_sql', title: 'SQL Fundamentals', thumbnail: '/assets/sql/fundamentals.jpg', duration: '10:50', video_url: 'https://example.com/videos/sql-fundamentals.mp4' },
        { course_id: 'course_sql', title: 'Joins and Aggregations', thumbnail: '/assets/sql/joins.jpg', duration: '14:35', video_url: 'https://example.com/videos/sql-joins.mp4' },
        { course_id: 'course_sql', title: 'Indexes and Optimization', thumbnail: '/assets/sql/indexes.jpg', duration: '13:55', video_url: 'https://example.com/videos/sql-indexes.mp4' }
      ],
    },
  ],
};
