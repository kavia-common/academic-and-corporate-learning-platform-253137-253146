# LMS Frontend (React) – Ocean Professional Shell

This app provides a modern LMS shell with a top app bar, sidebar navigation, and initial pages.

## Features

- Sidebar + top app bar layout matching "Ocean Professional" style
- Pages: Dashboard, Courses, Users, Assignments, Progress, Healthcheck
- Central API client using REACT_APP_API_BASE / REACT_APP_BACKEND_URL
- Feature flags scaffold via REACT_APP_FEATURE_FLAGS (CSV or JSON)
- Healthcheck route using REACT_APP_HEALTHCHECK_PATH
- Optional Supabase integration through REACT_APP_SUPABASE_URL/KEY (graceful when undefined)
- No hardcoded secrets

## Getting Started

Install and run:

```bash
npm install
npm start
```

App: http://localhost:3000

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

- REACT_APP_API_BASE: Base URL for backend (e.g., https://api.example.com)
- REACT_APP_BACKEND_URL: Alternative to API base (used if API_BASE not set)
- REACT_APP_HEALTHCHECK_PATH: Health path (default /healthz)
- REACT_APP_FEATURE_FLAGS: CSV ("flag1,flag2") or JSON ({"flag":true})
- REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_KEY: Optional Supabase config

## Project Structure

- src/components/Layout/AppLayout.jsx – App shell (topbar + sidebar)
- src/pages/Dashboard.jsx – Ocean Professional dashboard layout
- src/pages/{Courses,Users,Assignments,Progress}.jsx – placeholders
- src/pages/Healthcheck.jsx – pings backend health endpoint
- src/api/client.js – API helpers (GET/POST)
- src/config/env.js – Env parsing and helpers
- src/lib/supabase.js – Optional Supabase client (lazy)

## Notes

- The preview system is not modified.
- If you plan to use Supabase features, install @supabase/supabase-js and set env.
