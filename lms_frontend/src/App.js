import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { useAuth } from './auth/AuthProvider';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const { user, role, status, signOut } = useAuth();

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const isAuthed = status === 'authenticated';

  return (
    <div className="App">
      <header className="App-header">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          Current theme: <strong>{theme}</strong>
        </p>

        <div style={{ marginTop: 16 }}>
          <p className="App-link" style={{ marginBottom: 8 }}>
            Auth status: <strong>{status}</strong>
          </p>
          {isAuthed ? (
            <>
              <p style={{ margin: 0 }}>
                Logged in as: <strong>{user?.email || 'Unknown'}</strong>
              </p>
              <p style={{ marginTop: 4 }}>
                Role: <strong>{role}</strong>
              </p>
              <button
                onClick={() => signOut().catch(() => {})}
                style={{
                  marginTop: 12,
                  backgroundColor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <p style={{ marginTop: 8, opacity: 0.8 }}>
              You are not signed in.
            </p>
          )}
        </div>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
