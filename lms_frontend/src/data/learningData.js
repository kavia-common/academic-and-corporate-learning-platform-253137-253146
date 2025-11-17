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
        // Insert provided React lessons here
      ],
    },
    {
      key: 'course_js',
      title: 'JavaScript',
      lessons: [
        // Insert provided JavaScript lessons here
      ],
    },
    {
      key: 'course_html',
      title: 'HTML',
      lessons: [
        // Insert provided HTML lessons here
      ],
    },
    {
      key: 'course_css',
      title: 'CSS',
      lessons: [
        // Insert provided CSS lessons here
      ],
    },
    {
      key: 'course_python',
      title: 'Python',
      lessons: [
        // Insert provided Python lessons here
      ],
    },
    {
      key: 'course_django',
      title: 'Django',
      lessons: [
        // Insert provided Django lessons here
      ],
    },
    {
      key: 'course_sql',
      title: 'SQL',
      lessons: [
        // Insert provided SQL lessons here
      ],
    },
  ],
};
