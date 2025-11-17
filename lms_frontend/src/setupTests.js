/* jest-dom adds custom jest matchers for asserting on DOM nodes.
   allows you to do things like:
   expect(element).toHaveTextContent(/react/i)
   learn more: https://github.com/testing-library/jest-dom */
import '@testing-library/jest-dom';

// Silence expected warnings from env/supabase during tests to reduce noise
const originalWarn = global.console.warn;
beforeAll(() => {
  global.console.warn = (...args) => {
    const msg = (args && args[0]) ? String(args[0]) : '';
    if (msg.includes('Supabase env vars missing')) return;
    originalWarn(...args);
  };
});

afterAll(() => {
  global.console.warn = originalWarn;
});
