# LMS Frontend (React) – Ocean Professional Shell

This app provides a modern LMS shell with a top app bar, sidebar navigation, and Supabase-backed CRUD flows.

## Features

- Sidebar + top app bar layout matching "Ocean Professional" style
- Pages: Dashboard, Courses, Users, Assignments, Progress, Healthcheck
- Supabase integration:
  - Auth (email/password) with session persistence
  - Magic link sign-in and password reset (request + update)
  - Email verification guidance for unverified users
  - Session auto-refresh; refresh errors sign the user out
  - Data hooks and CRUD for profiles, courses, assignments, enrollments, submissions, and progress
  - Role-based UI (admin, instructor, student) via public.profiles.role with role guards
  - RLS-friendly queries; 401/403 handled with friendly messages
- Protected routes for core app sections when Supabase is configured
- Central API client using REACT_APP_API_BASE / REACT_APP_BACKEND_URL (for any non-Supabase backend)
- Feature flags via REACT_APP_FEATURE_FLAGS (CSV or JSON)
- Healthcheck route using REACT_APP_HEALTHCHECK_PATH
- Global ErrorBoundary and Toast notifications for user feedback
- No hardcoded secrets

## Getting Started

Install and run:

```bash
npm install
npm start
```

App: http://localhost:3000

## Authentication & Database (Supabase)

1) Create a Supabase project and enable Email/Password auth (Authentication → Providers). Magic link & password recovery use the same email provider.
2) Obtain:
   - SUPABASE URL
   - Supabase anon public key
3) Create `.env` from `.env.example` and set:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_KEY
   - (optional) REACT_APP_FRONTEND_URL (used for emailRedirectTo; falls back to `window.location.origin`)
   - The app will also fall back to SUPABASE_URL/SUPABASE_KEY if the REACT_APP_* variants are not present. For production builds and local CRA dev, using REACT_APP_* is recommended.
4) Routes:
   - Public:
     - `/` (Dashboard)
     - `/health`
     - `/auth/login`
     - `/auth/signup`
     - `/auth/magic` (request magic link)
     - `/auth/reset/request` (send reset email)
     - `/auth/reset` (land here from email to set new password; hash fragment handled by Supabase)
   - Protected:
     - `/courses`, `/courses/:id`, `/assignments/:id`, `/users`, `/progress`, `/me/progress`
5) If Supabase env vars are not set, the app:
   - Shows a non-blocking console warning
   - Displays a helpful message on auth pages
   - Treats protected routes as public to avoid blocking usage

### Auth Flows

- Login (email/password): `/auth/login`
- Signup: `/auth/signup` (sends verification link; unverified users get guidance)
- Magic link sign-in: `/auth/magic` (sends link to email)
- Password reset:
  - Request: `/auth/reset/request` (sends email)
  - Update: `/auth/reset` (opened from email; enter new password)
- Email verification:
  - After signup, users are asked to confirm their email. Once verified, they can proceed normally. Unverified users see guidance on Login.
- Session management:
  - Sessions persist across reloads; auto-refresh handled. If refresh fails (e.g., token invalid), the app signs out automatically.

### Role-based Access

- Roles from `public.profiles.role`: `admin`, `instructor`, `student`
- UI Guard: `src/auth/RoleGuard.jsx` prevents access to restricted sections with a friendly message.
- Example: `Users` page is restricted to admin/instructor.

## Environment Variable Prefix (React)

Create React App only exposes environment variables prefixed with `REACT_APP_`. This app reads:
- REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
- Falls back to SUPABASE_URL and SUPABASE_KEY if needed (a console warning will be shown)
- REACT_APP_FRONTEND_URL is used to construct email redirect URLs safely
- After changing `.env`, you may need to restart `npm start` or your preview session for changes to take effect.

## Canonical LMS Schema (public schema)
[unchanged content omitted for brevity — see earlier section in this file]

## Data Layer Hooks
[unchanged content omitted for brevity — see earlier section in this file]

## UI Pages
[unchanged content omitted for brevity — see earlier section in this file]

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

- REACT_APP_SUPABASE_URL: Supabase project URL (required for auth/data)
- REACT_APP_SUPABASE_KEY: Supabase anon public key
- REACT_APP_FRONTEND_URL: Public origin for email redirects (optional; defaults to window.location.origin)
- REACT_APP_API_BASE / REACT_APP_BACKEND_URL: non-Supabase backend base (optional)
- REACT_APP_HEALTHCHECK_PATH: Health path (default /healthz)
- REACT_APP_FEATURE_FLAGS: CSV ("flag1,flag2") or JSON ({"flag":true})
- REACT_APP_LOG_LEVEL: "info" | "debug" | "trace"

## Notes

- No secrets are hardcoded; all configuration is via environment variables.
- 401/403 responses from Supabase are surfaced as friendly error messages in the UI.
- For Supabase email flows, ensure your project's auth settings allow the redirect domain used by REACT_APP_FRONTEND_URL or your local origin.
