import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Progress overview page.
 * Instructors/Admins can view per-course progress in Course Detail → Progress tab.
 * Students can see their progress in /me/progress.
 */
export default function Progress() {
  const ui = {
    page: { maxWidth: 800, margin: '0 auto' },
    title: { font: '800 22px/28px "Helvetica Neue", Arial, sans-serif', color: '#111827', margin: '0 0 12px' },
    hint: { color: '#4B5563', fontSize: 14 },
    link: { color: 'var(--ocn-primary, #2563EB)', fontWeight: 700, textDecoration: 'none' }
  };
  return (
    <section style={ui.page}>
      <h1 style={ui.title}>Progress</h1>
      <p style={ui.hint}>
        Students: view your progress on <Link to="/me/progress" style={ui.link}>My Progress</Link>.
      </p>
      <p style={ui.hint}>
        Instructors/Admins: open a course from <Link to="/courses" style={ui.link}>Courses</Link> and use the Progress tab to see learners.
      </p>
    </section>
  );
}
