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

        {/* Quick access link to Learning Paths */}
        <div className="px-4 py-2">
          <Link to="/paths" className="nav-link text-blue-600 hover:underline">
            Browse Learning Paths
          </Link>
        </div>

        {/* Hidden but accessible theme toggle for users needing contrast change */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{
            position: 'fixed',
            bottom: 1,
            right: 1,
            zIndex: 5
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </BrowserRouter>
    </div>
  );
}

export default App;
