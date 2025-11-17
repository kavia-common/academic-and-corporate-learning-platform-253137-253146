import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Link } from 'react-router-dom';
import ApplicationRoutes from './routes';
import Container from './components/layout/Container';

/**
 * PUBLIC_INTERFACE
 * App applies theme and wraps the routed content with the Ocean Professional app shell.
 */
function App() {
  const [theme, setTheme] = useState('light');

  // Apply theme attribute for potential future theming; keeps backward compatibility
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="App" data-app-theme={theme}>
      <BrowserRouter>
        <Container>
          {/* Routed content renders here with Sidebar-only layout */}
          <ApplicationRoutes />
        </Container>

        {/* Quick access links */}
        <div className="px-4 py-2 flex items-center gap-4">
          <Link to="/courses" className="nav-link text-blue-600 hover:underline" aria-label="Browse Courses">
            Browse Courses
          </Link>
          <Link to="/learning-path" className="nav-link text-blue-600 hover:underline" aria-label="Learning Path">
            Learning Path
          </Link>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
