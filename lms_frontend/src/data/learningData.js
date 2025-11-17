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
 // PUBLIC_INTERFACE
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
         { course_id: 'course_react', title: 'Introduction to React', thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8', duration: '45 min', video_url: '' },
         { course_id: 'course_react', title: 'React Hooks Deep Dive', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '60 min', video_url: '' },
         { course_id: 'course_react', title: 'Advanced React Patterns', thumbnail: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '75 min', video_url: '' }
       ],
     },
     {
       key: 'course_js',
       title: 'JavaScript',
       lessons: [
         { course_id: 'course_js', title: 'JavaScript Fundamentals', thumbnail: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '40 min', video_url: '' },
         { course_id: 'course_js', title: 'Async JavaScript', thumbnail: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '55 min', video_url: '' },
         { course_id: 'course_js', title: 'ES6+ Features', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '50 min', video_url: '' }
       ],
     },
     {
       key: 'course_html',
       title: 'HTML',
       lessons: [
         { course_id: 'course_html', title: 'HTML Basics', thumbnail: 'https://images.unsplash.com/photo-1554224155-3a589877462e?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '35 min', video_url: '' },
         { course_id: 'course_html', title: 'Semantic HTML', thumbnail: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '45 min', video_url: '' },
         { course_id: 'course_html', title: 'Forms and Validation', thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '50 min', video_url: '' }
       ],
     },
     {
       key: 'course_css',
       title: 'CSS',
       lessons: [
         { course_id: 'course_css', title: 'CSS Fundamentals', thumbnail: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '40 min', video_url: '' },
         { course_id: 'course_css', title: 'Flexbox & Grid', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '55 min', video_url: '' },
         { course_id: 'course_css', title: 'Advanced CSS Techniques', thumbnail: 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '65 min', video_url: '' }
       ],
     },
     {
       key: 'course_python',
       title: 'Python',
       lessons: [
         { course_id: 'course_python', title: 'Python Basics', thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '45 min', video_url: '' },
         { course_id: 'course_python', title: 'Object-Oriented Python', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '60 min', video_url: '' },
         { course_id: 'course_python', title: 'Python for Data Science', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '70 min', video_url: '' }
       ],
     },
     {
       key: 'course_django',
       title: 'Django',
       lessons: [
         { course_id: 'course_django', title: 'Getting Started with Django', thumbnail: 'https://images.unsplash.com/photo-1530825894095-9c184b068fcb?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '50 min', video_url: '' },
         { course_id: 'course_django', title: 'Django ORM & Models', thumbnail: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '60 min', video_url: '' },
         { course_id: 'course_django', title: 'Django REST Framework', thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '70 min', video_url: '' }
       ],
     },
     {
       key: 'course_sql',
       title: 'SQL',
       lessons: [
         { course_id: 'course_sql', title: 'SQL Basics', thumbnail: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '40 min', video_url: '' },
         { course_id: 'course_sql', title: 'Joins & Subqueries', thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '55 min', video_url: '' },
         { course_id: 'course_sql', title: 'Indexes & Optimization', thumbnail: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?ixlib=rb-4.0.3&q=80&auto=format&fit=crop&w=1170', duration: '60 min', video_url: '' }
       ],
     },
   ],
 };
