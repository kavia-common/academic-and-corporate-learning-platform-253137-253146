import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Assignments landing page.
 * Direct users to assignments via Course → Assignments tab or direct Assignment links.
 */
export default function Assignments() {
  const ui = {
    page: { maxWidth: 800, margin: '0 auto' },
    title: { font: '800 22px/28px "Helvetica Neue", Arial, sans-serif', color: '#111827', margin: '0 0 12px' },
    hint: { color: '#4B5563', fontSize: 14 },
    link: { color: 'var(--ocn-primary, #2563EB)', fontWeight: 700, textDecoration: 'none' }
  };
  return (
    <section style={ui.page}>
      <h1 style={ui.title}>Assignments</h1>
      <p style={ui.hint}>
        Manage assignments from the <Link to="/courses" style={ui.link}>Courses</Link> page by opening a course and using the Assignments tab, or follow a direct assignment link shared by your instructor.
      </p>
    </section>
  );
}
