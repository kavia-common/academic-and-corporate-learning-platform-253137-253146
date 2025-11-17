import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
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
          {/* Routed content renders here with Sidebar + TopBar around it */}
          <ApplicationRoutes />
        </Container>

        {/* Hidden but accessible theme toggle for users needing contrast change */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 50
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </BrowserRouter>
    </div>
  );
}

export default App;
