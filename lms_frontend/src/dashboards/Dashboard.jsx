import React from 'react';
import '../styles/ocean.css';
import styles from './dashboard.module.css';

/**
 * PUBLIC_INTERFACE
 * Dashboard
 *
 * Ocean Professional themed dashboard matching the provided design:
 * - H1 header "Dashboard"
 * - KPI row with two stat cards (Learning Paths, Courses) including sparkline on the right card
 * - Lower grid with checklist (left) and donut chart (right)
 *
 * Accessibility:
 * - Semantic regions (header/main)
 * - ARIA labels for charts
 * - Keyboard focusable cards for screen readers
 * - Sufficient color contrast as per style guide
 */
export default function Dashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.container} role="region" aria-label="Dashboard content area">
        <h1 className={styles.h1}>Dashboard</h1>

        {/* KPI Row */}
        <section
          className={styles.kpiGrid}
          aria-label="Key performance indicators"
          role="list"
        >
          <div
            className={styles.kpiCard}
            style={{ background: 'var(--surface-purple)' }}
            role="listitem"
            tabIndex={0}
            aria-label="Learning Paths: 11"
          >
            <div className={styles.kpiValue}>11</div>
            <div className={styles.kpiLabel}>Learning Paths</div>
          </div>

          <div
            className={styles.kpiCard}
            style={{ background: 'var(--surface-blue)' }}
            role="listitem"
            tabIndex={0}
            aria-label="Courses: 7"
          >
            {/* Sparkline positioned at top-right inside card */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                insetInlineEnd: 12,
                insetBlockStart: 10,
                width: 96,
                height: 44,
                pointerEvents: 'none',
              }}
            >
              <Sparkline />
            </div>
            <div className="kpiValue">7</div>
            <div className="kpiLabel">Courses</div>
          </div>
        </section>

        {/* Lower Grid */}
        <section className={styles.lowerGrid} aria-label="Learning overview">
          {/* Checklist Card */}
          <div
            className={styles.checklistCard}
            role="group"
            aria-label="Technologies checklist"
          >
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: 8,
              }}
            >
              <CheckItem>HTML</CheckItem>
              <CheckItem>JavaScript</CheckItem>
              <CheckItem>CSS</CheckItem>
              <CheckItem>Python, Django, SQL</CheckItem>
            </ul>
          </div>

          {/* Donut Chart */}
          <div
            role="img"
            aria-label="Completion donut chart showing partial completion"
            style={{
              display: 'grid',
              placeItems: 'center',
              paddingBlockStart: 4,
            }}
          >
            <DonutChart diameter={120} thickness={32} value={0.45} />
            <span className={styles['sr-only']}>45 percent completed</span>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * CheckItem
 * Renders a checklist row with a green check icon and accessible text.
 */
export function CheckItem({ children }) {
  return (
    <li className={styles.checkItem}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7.5 13.5L3.5 9.5L2.1 10.9L7.5 16.3L18 5.8L16.6 4.4L7.5 13.5Z"
          fill="var(--accent-green-600)"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}

/**
 * PUBLIC_INTERFACE
 * Sparkline
 * Lightweight inline SVG sparkline for the Courses KPI card.
 */
export function Sparkline() {
  // Simple static points approximating the screenshot curve.
  const points = [
    [0, 28],
    [16, 20],
    [32, 26],
    [48, 10],
    [64, 18],
    [80, 8],
    [96, 16],
  ];
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  return (
    <svg width="96" height="44" viewBox="0 0 96 44" role="presentation" aria-hidden="true">
      <path
        d={d}
        stroke="var(--sparkline-stroke)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * DonutChart
 * Simple two-tone donut via SVG arcs.
 *
 * @param {number} diameter - Overall diameter of the donut.
 * @param {number} thickness - Stroke thickness.
 * @param {number} value - Fraction (0..1) of filled arc.
 */
export function DonutChart({ diameter = 120, thickness = 32, value = 0.45 }) {
  const center = diameter / 2;
  const radius = (diameter - thickness) / 2;

  // Convert value to stroke-dasharray for circular progress
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(1, value)) * circumference;

  return (
    <svg
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
      aria-hidden="true"
    >
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="var(--chart-green-300)"
        strokeWidth={thickness}
        fill="none"
      />
      {/* Foreground arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="var(--chart-green-700)"
        strokeWidth={thickness}
        fill="none"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="butt"
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
}
