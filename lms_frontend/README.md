# LMS Frontend (React)

This is the React single-page application for an academic and corporate learning platform. It provides authentication, role-based dashboards, course management, assignments, quizzes, and a user profile with avatar support. The app integrates with Supabase for authentication, database, and storage.

## Quick Start

1. Install Node.js 18+ and npm.
2. Copy .env.example to .env and set values:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_KEY
   - REACT_APP_FRONTEND_URL (optional but recommended for password reset redirects)
   - Other optional runtime settings as needed (see Environment Variables)
3. Install dependencies:
   - npm install
4. Run development server:
   - npm start
   The app will be available at http://localhost:3000.
5. Run tests:
   - CI=true npm test
6. Build for production:
   - npm run build

## Environment Variables

This app is based on Create React App (CRA). Only variables prefixed with REACT_APP_ are exposed to the browser. The following variables are defined in .env.example and are recognized by the code:

Required for Supabase (actually referenced by code):
- REACT_APP_SUPABASE_URL: Supabase project URL used by the client (src/supabase/client.js).
- REACT_APP_SUPABASE_KEY: Supabase anon public key used by the client (src/supabase/client.js).

Optional but supported:
- REACT_APP_FRONTEND_URL: Public URL of this SPA, used in auth flows such as password reset redirects (used in src/auth/AuthProvider.js).
- REACT_APP_API_BASE: Base URL for any additional backend API calls if used by your deployment (not referenced in current code by default).
- REACT_APP_BACKEND_URL: Canonical backend URL (not referenced in current code by default).
- REACT_APP_WS_URL: WebSocket URL if your deployment uses websockets (not referenced in current code).
- REACT_APP_NODE_ENV: Environment label for runtime diagnostics (not referenced in code).
- REACT_APP_NEXT_TELEMETRY_DISABLED: Disables Next.js telemetry in mixed environments (not required for CRA).
- REACT_APP_ENABLE_SOURCE_MAPS: Controls source map generation in builds when honored by your infra.
- REACT_APP_PORT: Local dev server port override when used with compatible tooling.
- REACT_APP_TRUST_PROXY: Informational flag for proxy setups.
- REACT_APP_LOG_LEVEL: Desired log level for any client logging if added.
- REACT_APP_HEALTHCHECK_PATH: Path to health endpoint if fronted by a probe.
- REACT_APP_FEATURE_FLAGS: JSON or CSV string of feature flags to toggle UI features.
- REACT_APP_EXPERIMENTS_ENABLED: Boolean-like flag to enable experimental UI.

Note on Vite variables:
- Some internal comments (src/config/env.js) mention VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for a Vite setup. This project uses CRA at present; set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in .env. You do not need to define VITE_* variables unless you migrate to Vite.

## Roles and Access

The app supports two roles derived from Supabase user.user_metadata.role. If not present, the role defaults to student.

- Admin: Full administrative access. Accesses /dashboard/admin and /admin. Can create/edit courses, assignments, and quizzes.
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
- Role redirects: /dashboard routes to /dashboard/{admin|student} based on role
- Admin: /dashboard/admin, /admin, /courses/new, /courses/:id/edit, /courses/:courseId/assignments/new, /assignments/:id/submissions, /quizzes/new, /courses/:courseId/quizzes/new
- Student: /dashboard/student, /assignments

## Implemented Features

- Authentication:
  - Sign in, sign up, sign out, and password reset via Supabase (src/auth and src/supabase/client.js).
  - Email verification flow supported through Supabase if enabled.
- Courses:
  - List, view course detail, create and edit (admin only) (src/courses/* and src/routes.jsx).
  - Enrollment actions handled in course detail.
- Assignments:
  - List and detail pages for assignments (public views; submission gated in components).
  - Create assignments (instructor/admin) and list submissions (src/assignments/*).
- Quizzes:
  - List, create (admin only), detail, and take quiz (src/quizzes/*).
  - Attempts management handled in quiz components and services.
- Profile with avatar:
  - The Profile page renders editable basic fields.
  - Avatar upload is currently a placeholder until Supabase storage helpers are integrated in the page. Storage utilities exist in src/supabase/supabaseStorage.js for enabling upload and signed URLs.
- Dashboards:
  - AdminDashboard, InstructorDashboard, StudentDashboard in src/dashboards provide role-specific overviews and recent data widgets.

## Supabase Requirements

Tables and typical columns expected by service modules (adjust to your schema as needed):
- users/profile: id (uuid), full_name, username, website, avatar_path
- courses: id, title, description, instructor_id, created_at, updated_at
- assignments: id, course_id, title, description, due_date, created_at
- submissions: id, assignment_id, student_id, content/url, grade, submitted_at
- quizzes: id, course_id, title, description, created_at
- questions: id, quiz_id, text, options (json), answer, points
- attempts: id, quiz_id, student_id, score, started_at, completed_at

Row Level Security (RLS) notes:
- Enable RLS on all tables and add policies that align with roles:
  - Students: read courses, see and create their own submissions/attempts.
  - Admins: broad read/write for administration and content management.
- Ensure user metadata contains user_metadata.role so the frontend can route and gate features correctly.

Authentication:
- Enable email/password authentication in Supabase. If email confirmation is enabled, new sign-ups may require verification before a session is active.

## Storage Bucket: avatars

Create a Supabase storage bucket for profile images:
- Bucket name: avatars
- Public vs private:
  - Public bucket works with getPublicUrl.
  - Private bucket requires signed URLs (createSignedUrl).
- Recommended avatar flow (to wire into Profile page):
  - Upload to avatars/{userId}/avatar.ext using uploadFile.
  - Store avatars path in user profile table (avatar_path).
  - Resolve a display URL via getPublicUrl or createSignedUrl.

Relevant helpers: src/supabase/supabaseStorage.js

## Development Notes

- Tech stack: React 18, react-router-dom v6, Supabase JS v2, Create React App (react-scripts).
- Styling: Minimal modern UI with “Ocean Professional” theme variables.
- Testing: A smoke test exists at src/__tests__/test_routing_auth_smoke.test.jsx covering routing and guards.

## Troubleshooting

- Missing Supabase config:
  - Console warns if REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY are not set.
  - Ensure .env variables are defined before running npm start or npm run build.
- Password reset redirect:
  - If resetPassword errors, set REACT_APP_FRONTEND_URL to your app’s URL so Supabase can redirect back to the app.
- Routing:
  - Unknown routes fall back to Home. Use /dashboard to be redirected to your role’s dashboard.

## License

Proprietary. All rights reserved.
