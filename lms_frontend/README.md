# LMS Frontend (React) – Ocean Professional Shell

This app provides a modern LMS shell with a top app bar, sidebar navigation, and initial pages.

## Features

- Sidebar + top app bar layout matching "Ocean Professional" style
- Pages: Dashboard, Courses, Users, Assignments, Progress, Healthcheck
- Authentication (optional) via Supabase Auth (email/password)
  - Session persistence with onAuthStateChange
  - Protected routes for core app sections
  - Login and Signup pages with Ocean Professional styling
  - User menu in top bar with email + Logout
  - Graceful behavior when Supabase is not configured
- Central API client using REACT_APP_API_BASE / REACT_APP_BACKEND_URL
- Feature flags scaffold via REACT_APP_FEATURE_FLAGS (CSV or JSON)
- Healthcheck route using REACT_APP_HEALTHCHECK_PATH
- No hardcoded secrets

## Getting Started

Install and run:

```bash
npm install
npm start
```

App: http://localhost:3000

## Authentication Setup (Supabase)

1) Create a Supabase project and enable Email/Password auth (Authentication → Providers).
2) Obtain:
   - SUPABASE URL
   - SUPABASE anon public key
3) Create `.env` from `.env.example` and set:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_KEY
4) For email confirmation flows, the app sets `emailRedirectTo` using:
   - `REACT_APP_FRONTEND_URL` if provided (e.g., http://localhost:3000)
   - Fallback to `window.location.origin`
5) Routes:
   - Public: `/`, `/health`, `/auth/login`, `/auth/signup`
   - Protected: `/courses`, `/users`, `/assignments`, `/progress`
6) If Supabase env vars are not set, the app:
   - Shows a non-blocking console warning
   - Displays a helpful message on auth pages
   - Treats protected routes as protected only when configured

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

- REACT_APP_API_BASE: Base URL for backend (e.g., https://api.example.com)
- REACT_APP_BACKEND_URL: Alternative to API base (used if API_BASE not set)
- REACT_APP_HEALTHCHECK_PATH: Health path (default /healthz)
- REACT_APP_FEATURE_FLAGS: CSV ("flag1,flag2") or JSON ({"flag":true})
- REACT_APP_SUPABASE_URL: Supabase project URL (optional; enables auth when set)
- REACT_APP_SUPABASE_KEY: Supabase anon public key (optional; enables auth when set)
- REACT_APP_FRONTEND_URL: Public origin for emailRedirectTo (optional; falls back to window.location.origin)
- REACT_APP_LOG_LEVEL: "info" | "debug" | "trace" (optional)

## Project Structure

- src/components/Layout/AppLayout.jsx – App shell (topbar + sidebar, user menu)
- src/pages/Dashboard.jsx – Ocean Professional dashboard layout
- src/pages/{Courses,Users,Assignments,Progress}.jsx – placeholders
- src/pages/Healthcheck.jsx – pings backend health endpoint
- src/pages/auth/{Login,Signup}.jsx – Auth pages
- src/auth/{AuthContext,ProtectedRoute}.jsx – Auth context and route guard
- src/api/client.js – API helpers (GET/POST)
- src/config/env.js – Env parsing and helpers
- src/lib/supabase.js – Optional Supabase client (lazy)

## Notes

- The preview system is not modified.
- No secrets are hardcoded; all config is via environment variables.
