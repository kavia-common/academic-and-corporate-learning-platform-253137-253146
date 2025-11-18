# academic-and-corporate-learning-platform-253137-253146

This workspace contains the LMS frontend (React). Authentication can be enabled using Supabase (email/password, magic link, and password reset) by setting REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in lms_frontend/.env.

Notes on environment variables (React):
- Create React App only exposes variables prefixed with REACT_APP_. Set:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_KEY
  - (optional) REACT_APP_FRONTEND_URL used for email redirect URLs
- If you already have SUPABASE_URL and SUPABASE_KEY in your environment, the app will fall back to them automatically, but using the REACT_APP_ prefix is recommended for builds.
- After changing .env, you may need to stop and restart the dev server or preview for changes to take effect.

Auth routes:
- /auth/login, /auth/signup
- /auth/magic (send sign-in link)
- /auth/reset/request (send reset email)
- /auth/reset (update password when coming from email link)
