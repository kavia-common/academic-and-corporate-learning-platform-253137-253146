# LMS Frontend (React)

This is the React single-page application for an academic and corporate learning platform. It provides authentication, role-based dashboards, course management, assignments, quizzes, and a user profile with avatar support. The app integrates with Supabase for authentication, database, and storage.

## Quick Start

1. Install Node.js 18+ and npm.
2. Copy .env.example to .env and set values:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_KEY
   - REACT_APP_FRONTEND_URL (optional but recommended for password reset redirects)
   - Other optional runtime settings as needed
3. Install dependencies:
   - npm install
4. Run development server:
   - npm start
   The app will be available at http://localhost:3000.
5. Run tests:
   - CI=true npm test

## Environment Variables

The frontend reads environment variables from process.env at build/run time. Only variables prefixed with REACT_APP_ are available to the browser. The following variables are supported:

- REACT_APP_API_BASE: Base URL for any additional backend API calls if used by your deployment.
- REACT_APP_BACKEND_URL: Canonical backend URL (not directly used by current code, but available for integrations).
- REACT_APP_FRONTEND_URL: Public URL of this SPA, used in auth flows such as password reset redirects.
- REACT_APP_WS_URL: WebSocket URL if your deployment uses websockets.
- REACT_APP_NODE_ENV: Environment label for runtime diagnostics.
- REACT_APP_NEXT_TELEMETRY_DISABLED: If present, disables Next.js telemetry in environments that run Next tools (not required for CRA).
- REACT_APP_ENABLE_SOURCE_MAPS: Controls source maps generation in builds when your infra honors this flag.
- REACT_APP_PORT: Local dev server port override when used with compatible tooling.
- REACT_APP_TRUST_PROXY: Enable proxy trust in reverse-proxy setups (informational for frontend).
- REACT_APP_LOG_LEVEL: Desired log level for any client logging.
- REACT_APP_HEALTHCHECK_PATH: Path to health endpoint if fronted by a probe.
- REACT_APP_FEATURE_FLAGS: JSON or CSV string of feature flags to toggle UI features.
- REACT_APP_EXPERIMENTS_ENABLED: Boolean-like flag to enable experimental UI.
- REACT_APP_SUPABASE_URL: Required. Supabase project URL used by the client.
- REACT_APP_SUPABASE_KEY: Required. Supabase anon public key used by the client.

Important notes:
- src/supabase/client.js reads REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY. If they are not set, the app will warn in console and Supabase calls will fail.
- src/auth/AuthProvider.js optionally uses REACT_APP_FRONTEND_URL to build redirect URLs for resetPassword.
- src/config/env.js documents VITE_* variables for an alternative setup. In this CRA-based app, use the REACT_APP_* variables as listed above.

## Setup Steps

- Clone the repository and go to lms_frontend:
  - cd academic-and-corporate-learning-platform-253137-253146/lms_frontend
- Create your .env from the example:
  - cp .env.example .env
  - Fill in REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY with your Supabase project details.
  - Optionally set REACT_APP_FRONTEND_URL to your local or deployed URL (e.g., http://localhost:3000).
- Install and run:
  - npm install
  - npm start
- Build for production:
  - npm run build

## Roles and Access

The app supports three roles which are derived from Supabase user.user_metadata.role. If not present, the role defaults to student.

- Admin: Full administrative access. Accesses /dashboard/admin and /admin.
- Instructor: Course and content management. Accesses /dashboard/instructor and /instructor. Can create/edit courses, assignments, and quizzes.
- Student: Learner access to enrollments, assignments, and quizzes. Accesses /dashboard/student.

Role resolution occurs in src/auth/AuthProvider.js. Route protections are implemented via:
- ProtectedRoute: Requires authentication for nested routes.
- RoleRoute: Restricts access to specific roles.

## Navigation Overview

Primary navigation is defined in:
- src/components/layout/Sidebar.jsx: Renders links tailored to authentication state and user role.
- src/routes.jsx: Central routing with public, protected, and role-restricted routes.

Key routes:
- Public: /, /courses, /courses/:id, /quizzes, /quizzes/:id, /quizzes/:id/take, /login, /signup, /reset-password, /verify-email
- Protected (any authenticated user): /dashboard, /profile
- Role redirects: /dashboard routes to /dashboard/{admin|instructor|student} based on role
- Admin: /dashboard/admin, /admin
- Instructor: /dashboard/instructor, /instructor, /courses/new, /courses/:id/edit, /courses/:courseId/assignments/new, /assignments/:id/submissions, /quizzes/new, /courses/:courseId/quizzes/new
- Student: /dashboard/student, /assignments

## Implemented Features

- Authentication:
  - Sign in, sign up, sign out, and password reset via Supabase (src/auth and src/supabase/client.js).
  - Email verification flow supported through Supabase if enabled.
- Courses:
  - List, view course detail, create and edit (instructor/admin) (src/courses/* and src/routes.jsx).
  - Enrollment actions handled in course detail.
- Assignments:
  - List and detail pages for assignments (public views; submission gated in components).
  - Create assignments (instructor/admin) and list submissions (src/assignments/*).
- Quizzes:
  - List, create (instructor/admin), detail, and take quiz (src/quizzes/*).
  - Attempts management handled in quiz components and services.
- Profile with avatar:
  - The Profile page renders editable basic fields.
  - Avatar upload is currently a placeholder until Supabase storage helpers are integrated in the page. Storage utilities exist in src/supabase/supabaseStorage.js for enabling upload and signed URLs.
- Dashboards:
  - AdminDashboard, InstructorDashboard, StudentDashboard in src/dashboards provide role-specific overviews and recent data widgets.

## Supabase Expectations

Schema:
- Users: The app reads user.user_metadata.role for authorization decisions. Ensure new users have user_metadata.role set to one of admin, instructor, or student.
- Courses, Assignments, Submissions, Quizzes, Questions, Attempts: The service modules under src/supabase/ (supabaseUsers.js, supabaseCourses.js, supabaseAssignments.js, supabaseQuizzes.js) expect corresponding tables with typical columns:
  - users/profile: id (uuid), full_name, username, website, avatar_path
  - courses: id, title, description, instructor_id, created_at, updated_at
  - assignments: id, course_id, title, description, due_date, created_at
  - submissions: id, assignment_id, student_id, content/url, grade, submitted_at
  - quizzes: id, course_id, title, description, created_at
  - questions: id, quiz_id, text, options (json), answer, points
  - attempts: id, quiz_id, student_id, score, started_at, completed_at
Adjust names/types to match your Supabase schema and update service modules if your tables differ.

RLS:
- Enable Row Level Security and create policies that allow appropriate role access. For example, students can read courses and their own submissions, instructors can manage their course content, admins have broader access. Align policies with the frontend’s expectations.

Auth:
- Email/password auth should be enabled. Configure email confirmation per your requirements. If email confirmation is on, sign-up may not yield a session until verification completes.

## Storage Buckets

For profile avatars and other uploads, create a Supabase storage bucket, for example:
- Bucket name: avatars
- Public: You can either mark public and use getPublicUrl, or keep private and use signed URLs.
- The storage helper in src/supabase/supabaseStorage.js includes:
  - uploadFile(path, file, bucket)
  - getPublicUrl(path, bucket)
  - createSignedUrl(path, expiresIn, bucket)
  - removeFile(path, bucket)
  - listFiles(prefix, bucket)

To enable avatar uploads in the Profile page, wire these helpers to:
- Allow user to select a file
- Upload to avatars/{userId}/avatar.ext
- Store the avatar_path in user profile table
- Resolve and display a public or signed URL

## Development Notes

- Tech stack: React 18, react-router-dom v6, Supabase JS v2, Create React App (react-scripts).
- Styling: Minimal modern UI with “Ocean Professional” theme variables.
- Testing: A smoke test exists at src/__tests__/test_routing_auth_smoke.test.jsx covering routing and guards.

## Troubleshooting

- Missing Supabase config:
  - Console will warn if REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY are not set.
  - Ensure .env variables are defined before running npm start or npm run build.
- Password reset redirect:
  - If resetPassword errors, set REACT_APP_FRONTEND_URL to your app’s public URL so Supabase can redirect back to /auth/callback (or adjust as needed).
- Routing:
  - Unknown routes fall back to Home. Use /dashboard to be redirected to your role’s dashboard.

## License

Proprietary. All rights reserved.
