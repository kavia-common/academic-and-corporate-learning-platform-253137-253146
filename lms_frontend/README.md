# LMS Frontend (React) – Ocean Professional Shell

This app provides a modern LMS shell with a top app bar, sidebar navigation, and Supabase-backed CRUD flows.

## Features

- Sidebar + top app bar layout matching "Ocean Professional" style
- Pages: Dashboard, Courses, Users, Assignments, Progress, Healthcheck
- Supabase integration:
  - Auth (email/password) with session persistence
  - Data hooks and CRUD for profiles, courses, assignments, enrollments, submissions, and progress
  - Role-based UI (admin, instructor, student) via public.profiles.role
  - RLS-friendly queries; 401/403 handled with friendly messages
- Protected routes for core app sections when Supabase is configured
- Central API client using REACT_APP_API_BASE / REACT_APP_BACKEND_URL (for any non-Supabase backend)
- Feature flags via REACT_APP_FEATURE_FLAGS (CSV or JSON)
- Healthcheck route using REACT_APP_HEALTHCHECK_PATH
- No hardcoded secrets

## Getting Started

Install and run:

```bash
npm install
npm start
```

App: http://localhost:3000

## Authentication & Database (Supabase)

1) Create a Supabase project and enable Email/Password auth (Authentication → Providers).
2) Obtain:
   - SUPABASE URL
   - SUPABASE anon public key
3) Create `.env` from `.env.example` and set:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_KEY
   - (optional) REACT_APP_FRONTEND_URL (used for emailRedirectTo; falls back to window.location.origin)
   - The app will also fall back to SUPABASE_URL/SUPABASE_KEY if the REACT_APP_* variants are not present. For production builds and local CRA dev, using REACT_APP_* is recommended.
4) Routes:
   - Public: `/`, `/health`, `/auth/login`, `/auth/signup`
   - Protected: `/courses`, `/courses/:id`, `/assignments/:id`, `/users`, `/progress`, `/me/progress`
5) If Supabase env vars are not set, the app:
   - Shows a non-blocking console warning
   - Displays a helpful message on auth pages
   - Treats protected routes as public to avoid blocking usage

## Environment Variable Prefix (React)

Create React App only exposes environment variables prefixed with `REACT_APP_`. This app reads:
- REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
- Falls back to SUPABASE_URL and SUPABASE_KEY if needed (a console warning will be shown)
- After changing `.env`, you may need to restart `npm start` or your preview session for changes to take effect.

## Canonical LMS Schema (public schema)

- profiles
  - id uuid PK references auth.users.id
  - email text
  - full_name text
  - role text CHECK IN ('admin','instructor','student')
- courses
  - id uuid default gen_random_uuid() primary key
  - title text
  - description text
  - created_by uuid references profiles.id
  - published boolean default false
  - created_at timestamptz default now(), updated_at timestamptz default now()
- assignments
  - id uuid pk
  - course_id uuid references courses.id
  - title text
  - description text
  - due_at timestamptz
  - max_points int
  - created_at/updated_at timestamptz
- enrollments
  - id uuid pk
  - course_id uuid references courses.id
  - user_id uuid references profiles.id
  - status text default 'active'
  - enrolled_at timestamptz default now()
  - unique (course_id, user_id)
- submissions
  - id uuid pk
  - assignment_id uuid references assignments.id
  - user_id uuid references profiles.id
  - submitted_at timestamptz
  - content_url text
  - content_text text
  - grade_points int
  - graded_at timestamptz
  - feedback text
  - unique (assignment_id, user_id)
- progress
  - id uuid pk
  - user_id uuid references profiles.id
  - course_id uuid references courses.id
  - percent_complete numeric
  - last_activity_at timestamptz
  - unique (user_id, course_id)

## RLS Policy Checklist (to be configured in Supabase)

- profiles:
  - SELECT: user can read own profile; admin can read all
- courses:
  - SELECT:
    - admin: all
    - instructor: where created_by = auth.uid()
    - student: where id IN (SELECT course_id FROM enrollments WHERE user_id = auth.uid())
  - INSERT/UPDATE/DELETE: admin + instructor (with ownership)
- assignments:
  - SELECT: same visibility as parent course
  - INSERT/UPDATE/DELETE: admin + instructor for courses they manage
- enrollments:
  - SELECT: admin + instructor for their courses; student sees their own rows
  - INSERT/UPDATE/DELETE: admin + instructor for their courses
- submissions:
  - SELECT: admin + instructor for their courses; student sees own submission
  - INSERT/UPDATE (upsert): student for own submission; grading fields only by admin/instructor
- progress:
  - SELECT: student sees own; admin/instructor see for their courses

Ensure 401/403 errors return when a user violates policies; the UI will show friendly messages.

## Data Layer Hooks

- src/hooks/useSupabaseProfile.js
  - Returns { profile, isAdmin, isInstructor, isStudent }
- src/hooks/useCourses.js
  - useCourses(): list courses respecting role
  - useCourseMutations(): create/update/delete with optimistic UI
- src/hooks/useAssignments.js
  - useAssignments(courseId)
  - useAssignmentMutations(courseId)
- src/hooks/useEnrollments.js
  - useEnrollments(courseId)
  - useEnrollmentMutations(courseId)
- src/hooks/useSubmissions.js
  - useSubmissions(assignmentId)
  - useSubmissionMutations(assignmentId): submitWork (student), gradeSubmission (instructor/admin)
- src/hooks/useProgress.js
  - useProgress({ userId, courseId })

All Supabase operations use the client created from environment variables via src/config/env.js.

## UI Pages

- /courses
  - List courses; create/edit/delete for admin/instructor
  - Navigate to /courses/:id
- /courses/:id (CourseDetail)
  - Tabs: Assignments (CRUD), Enrollments (manage), Progress (view by course)
- /assignments/:id (AssignmentDetail)
  - Students submit, Instructors/Admins grade
- /me/progress (MyProgress)
  - Student's own progress across courses
- /progress
  - Overview; links to course-level or student-level views

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

- REACT_APP_SUPABASE_URL: Supabase project URL (required for auth/data)
- REACT_APP_SUPABASE_KEY: Supabase anon public key
- REACT_APP_FRONTEND_URL: Public origin for emailRedirectTo (optional)
- REACT_APP_API_BASE / REACT_APP_BACKEND_URL: non-Supabase backend base (optional)
- REACT_APP_HEALTHCHECK_PATH: Health path (default /healthz)
- REACT_APP_FEATURE_FLAGS: CSV ("flag1,flag2") or JSON ({"flag":true})
- REACT_APP_LOG_LEVEL: "info" | "debug" | "trace"

## Notes

- No secrets are hardcoded; all config is via environment variables.
- 401/403 responses from Supabase are surfaced as friendly error messages in the UI.
