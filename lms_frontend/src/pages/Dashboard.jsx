import React from 'react';
import './dashboard.css';

function Sparkline() {
  const points = [4, 9, 7, 12, 10, 14, 13, 16];
  const max = Math.max(...points);
  const path = points.map((v, i) => `${i * 20},${30 - (v / max) * 30}`).join(' ');
  return (
    <svg aria-hidden="true" width="140" height="36" style={{ position: 'absolute', right: 12, top: 10, opacity: 0.9 }}>
      <polyline fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" points={path} />
    </svg>
  );
}

function Donut({ size = 120, thickness = 24, percent = 45 }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`Completion: ${percent}%`}
      style={{ display: 'block', margin: '0 auto' }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#9BE5CC"
        strokeWidth={thickness}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#1FB37A"
        strokeWidth={thickness}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * Dashboard page with KPI cards, checklist and donut chart per Ocean Professional guide.
 */
export default function Dashboard() {
  return (
    <div className="page">
      <div className="container">
        <h1 className="h1">Dashboard</h1>

        <section className="kpiGrid" aria-label="Key performance indicators">
          <div className="kpiCard" style={{ background: '#6A3ECD' }}>
            <div className="kpiValue">11</div>
            <div className="kpiLabel">Learning Paths</div>
          </div>
          <div className="kpiCard" style={{ background: '#2E8BEF', overflow: 'hidden' }}>
            <Sparkline />
            <div className="kpiValue">7</div>
            <div className="kpiLabel">Courses</div>
          </div>
        </section>

        <section className="lowerGrid" aria-label="Learning checklist and progress">
          <div className="checklistCard" role="group" aria-label="Checklist">
            <div className="checkItem">
              <span aria-hidden="true" style={{ color: '#28C08A' }}>✔</span>
              <span>HTML</span>
            </div>
            <div className="checkItem">
              <span aria-hidden="true" style={{ color: '#28C08A' }}>✔</span>
              <span>JavaScript</span>
            </div>
            <div className="checkItem">
              <span aria-hidden="true" style={{ color: '#28C08A' }}>✔</span>
              <span>CSS</span>
            </div>
            <div className="checkItem">
              <span aria-hidden="true" style={{ color: '#28C08A' }}>✔</span>
              <span>Python, Django, SQL</span>
            </div>
          </div>
          <div>
            <Donut percent={45} />
          </div>
        </section>
      </div>
    </div>
  );
}
