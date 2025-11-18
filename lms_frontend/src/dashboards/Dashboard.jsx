import React, { useEffect, useMemo, useState } from 'react';
import '../styles/ocean.css';
import styles from './dashboard.module.css';
import {
  getDashboardSummary,
  getDashboardProgress,
  getDashboardActivity,
  getDashboardTrends,
  getResolvedApiBase,
} from '../services/dashboardApi';

/**
 * PUBLIC_INTERFACE
 * Dashboard
 *
 * Ocean Professional themed dashboard.
 * Now wired to live API via src/services/dashboardApi.js:
 * - Summary stats (Learning Paths placeholder -> learners; Courses)
 * - Sparkline shows trend series
 * - Checklist shows recent activity items
 * - Donut chart shows completion breakdown
 *
 * Accessibility:
 * - Semantic regions, ARIA labels, keyboard focusable items, and live regions.
 */
export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activity, setActivity] = useState(null);
  const [trends, setTrends] = useState(null);

  const [loading, setLoading] = useState({
    summary: true,
    progress: true,
    activity: true,
    trends: true,
  });

  const [errors, setErrors] = useState({
    summary: null,
    progress: null,
    activity: null,
    trends: null,
  });

  const apiBase = getResolvedApiBase();

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const data = await getDashboardSummary();
        if (!isMounted) return;
        setSummary({
          courses: Number(data?.courses ?? 0),
          learners: Number(data?.learners ?? 0),
          completionRate: typeof data?.completionRate === 'number' ? data.completionRate : Number(String(data?.completionRate || '0').replace('%', '')) || 0,
          activeSessions: Number(data?.activeSessions ?? 0),
        });
      } catch (e) {
        if (isMounted) setErrors((p) => ({ ...p, summary: e?.message || 'Failed to load summary' }));
      } finally {
        if (isMounted) setLoading((p) => ({ ...p, summary: false }));
      }
    }

    async function loadProgress() {
      try {
        const data = await getDashboardProgress();
        if (!isMounted) return;
        setProgress({
          completed: Number(data?.completed ?? 0),
          inProgress: Number(data?.inProgress ?? 0),
          notStarted: Number(data?.notStarted ?? 0),
        });
      } catch (e) {
        if (isMounted) setErrors((p) => ({ ...p, progress: e?.message || 'Failed to load progress' }));
      } finally {
        if (isMounted) setLoading((p) => ({ ...p, progress: false }));
      }
    }

    async function loadActivity() {
      try {
        const data = await getDashboardActivity();
        if (!isMounted) return;
        const items = Array.isArray(data) ? data : [];
        setActivity(items);
      } catch (e) {
        if (isMounted) setErrors((p) => ({ ...p, activity: e?.message || 'Failed to load activity' }));
      } finally {
        if (isMounted) setLoading((p) => ({ ...p, activity: false }));
      }
    }

    async function loadTrends() {
      try {
        const data = await getDashboardTrends();
        if (!isMounted) return;
        const series = Array.isArray(data?.series) ? data.series.map((n) => Number(n || 0)) : [];
        setTrends({ series, labels: data?.labels || [] });
      } catch (e) {
        if (isMounted) setErrors((p) => ({ ...p, trends: e?.message || 'Failed to load trends' }));
      } finally {
        if (isMounted) setLoading((p) => ({ ...p, trends: false }));
      }
    }

    loadSummary();
    loadProgress();
    loadActivity();
    loadTrends();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      // Left KPI: "Learning Paths" in design; mapping to learners for now since summary provides learners
      { label: 'Learners', value: summary.learners, aria: `Learners: ${summary.learners}`, bg: 'var(--surface-purple)' },
      { label: 'Courses', value: summary.courses, aria: `Courses: ${summary.courses}`, bg: 'var(--surface-blue)' },
    ];
  }, [summary]);

  const renderError = (message) => (
    <div role="alert" className={styles.error} aria-live="polite">
      {message}
    </div>
  );
  const renderLoading = (label) => (
    <div role="status" className={styles.loading} aria-live="polite" aria-label={`${label} loading`}>
      Loading {label}...
    </div>
  );

  const completionFraction = useMemo(() => {
    if (!summary) return 0;
    const rate = typeof summary.completionRate === 'number' ? summary.completionRate : 0;
    return Math.max(0, Math.min(1, rate / 100));
  }, [summary]);

  return (
    <div className={styles.page}>
      <div className={styles.container} role="region" aria-label="Dashboard content area">
        <h1 className={styles.h1}>Dashboard</h1>

        {!apiBase && (
          <div role="alert" className={styles.error} aria-live="assertive">
            API base is not configured. Please set REACT_APP_API_BASE or REACT_APP_BACKEND_URL.
          </div>
        )}

        {/* KPI Row */}
        <section
          className={styles.kpiGrid}
          aria-label="Key performance indicators"
          role="list"
        >
          {/* Left KPI - Learners */}
          <div
            className={styles.kpiCard}
            style={{ background: 'var(--surface-purple)' }}
            role="listitem"
            tabIndex={0}
            aria-label={stats[0]?.aria || 'Learners'}
          >
            {loading.summary && renderLoading('summary')}
            {errors.summary && renderError(errors.summary)}
            {!loading.summary && !errors.summary && summary && (
              <>
                <div className={styles.kpiValue}>{stats[0]?.value ?? 0}</div>
                <div className={styles.kpiLabel}>{stats[0]?.label ?? 'Learners'}</div>
              </>
            )}
          </div>

          {/* Right KPI - Courses with Sparkline */}
          <div
            className={styles.kpiCard}
            style={{ background: 'var(--surface-blue)' }}
            role="listitem"
            tabIndex={0}
            aria-label={stats[1]?.aria || 'Courses'}
          >
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
              {/* Sparkline reflects live trend data if available */}
              {loading.trends ? null : errors.trends ? null : (
                <Sparkline points={trends?.series} />
              )}
            </div>
            {loading.summary && renderLoading('summary')}
            {errors.summary && renderError(errors.summary)}
            {!loading.summary && !errors.summary && summary && (
              <>
                <div className="kpiValue">{stats[1]?.value ?? 0}</div>
                <div className="kpiLabel">{stats[1]?.label ?? 'Courses'}</div>
              </>
            )}
          </div>
        </section>

        {/* Lower Grid */}
        <section className={styles.lowerGrid} aria-label="Learning overview">
          {/* Checklist Card */}
          <div
            className={styles.checklistCard}
            role="group"
            aria-label="Recent activity checklist"
          >
            {loading.activity && renderLoading('activity')}
            {errors.activity && renderError(errors.activity)}
            {!loading.activity && !errors.activity && (
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gap: 8,
                }}
              >
                {(activity || []).map((item) => (
                  <CheckItem key={item.id} completed={Boolean(item.completed)}>
                    <span>
                      {item.title}
                      {item.timestamp ? (
                        <time
                          dateTime={new Date(item.timestamp).toISOString()}
                          className={styles.timestamp}
                          aria-label={`at ${new Date(item.timestamp).toLocaleString()}`}
                        >
                          {' '}· {new Date(item.timestamp).toLocaleString()}
                        </time>
                      ) : null}
                    </span>
                  </CheckItem>
                ))}
                {activity && activity.length === 0 && (
                  <li className={styles.muted}>No recent activity.</li>
                )}
              </ul>
            )}
          </div>

          {/* Donut Chart */}
          <div
            role="img"
            aria-label="Completion donut chart"
            style={{
              display: 'grid',
              placeItems: 'center',
              paddingBlockStart: 4,
            }}
          >
            {loading.progress && renderLoading('progress')}
            {errors.progress && renderError(errors.progress)}
            {!loading.progress && !errors.progress && (
              <>
                <DonutChart diameter={120} thickness={32} value={completionFraction} />
                <span className={styles['sr-only']}>
                  {Math.round((completionFraction || 0) * 100)} percent completed
                </span>
                {summary && (
                  <div className={styles.legend} aria-hidden="true">
                    <ul className={styles.legendList}>
                      <li><span className={styles.legendCompleted} /> Completed: {progress?.completed ?? 0}</li>
                      <li><span className={styles.legendInProgress} /> In Progress: {progress?.inProgress ?? 0}</li>
                      <li><span className={styles.legendNotStarted} /> Not Started: {progress?.notStarted ?? 0}</li>
                    </ul>
                  </div>
                )}
              </>
            )}
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
export function CheckItem({ children, completed = true }) {
  return (
    <li className={styles.checkItem}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={completed}
        readOnly
        aria-label="Toggle completed"
      />
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
 * Inline SVG sparkline. If points not provided, renders a subtle baseline.
 *
 * @param {Object} props
 * @param {number[]} [props.points]
 */
export function Sparkline({ points }) {
  const width = 96;
  const height = 44;

  // Normalize points to fit within viewBox (simple scaling)
  const normalized = Array.isArray(points) && points.length > 0
    ? points.map((v, i) => [i * (width / Math.max(1, points.length - 1)), height - (Number.isFinite(v) ? v : 0)])
    : null;

  const d = normalized
    ? normalized.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
    : null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="presentation" aria-hidden="true">
      {d ? (
        <path
          d={d}
          stroke="var(--sparkline-stroke)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <line x1="0" y1={height - 2} x2={width} y2={height - 2} stroke="var(--sparkline-stroke)" strokeWidth="1" />
      )}
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

  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  const dash = clamped * circumference;

  return (
    <svg
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
      aria-hidden="true"
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="var(--chart-green-300)"
        strokeWidth={thickness}
        fill="none"
      />
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
