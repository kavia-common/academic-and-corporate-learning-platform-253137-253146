# Local Store (Client-side Demo)

This module provides a lightweight client-side overlay store for the LMS demo.

- Initial data is read from `src/data/learningData.js`.
- User-created or edited items are stored in `localStorage` and merged over initial data.
- This simulates persistence for the current browser session.

APIs:
- getAllCourses()
- addCourse(course)
- updateCourse(id, patch)
- getAllLearningPaths()
- addLearningPath(path)
- updateLearningPath(id, patch)

Note:
- This is a demo-only approach and not secure. For production, connect forms to backend APIs with authentication and authorization.
