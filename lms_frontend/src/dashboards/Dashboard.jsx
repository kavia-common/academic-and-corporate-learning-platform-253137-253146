import React from 'react';
import styles from './dashboard.module.css';

// PUBLIC_INTERFACE
export default function Dashboard() {
  /**
   * Static reference-only dashboard view.
   * Renders an uploaded reference image inside an Ocean Professional themed container.
   * - No API calls
   * - Responsive, accessible image
   * - Fits viewport height, centers content
   *
   * Accessibility:
   * - Main landmark for screen readers
   * - Meaningful alt text for the image
   * - Preserves app layout (sidebar/top bar) if present in parent layout
   */
  const imageSrc = '/assets/20251118_045743_image.png';
  const altText = 'Dashboard reference view depicting the intended layout and design.';

  return (
    <main className={styles.page} aria-labelledby="dashboard-title" tabIndex={-1}>
      <section className={styles.container} role="region" aria-label="Dashboard reference">
        <header className={styles.header}>
          <h1 id="dashboard-title" className={styles.title}>Dashboard Reference</h1>
          <p className={styles.caption}>
            This non-interactive dashboard shows the current design reference.
          </p>
        </header>

        <div className={styles.surface} role="img" aria-label={altText}>
          <img
            className={styles.referenceImage}
            src={imageSrc}
            alt={altText}
            loading="eager"
          />
        </div>
      </section>
    </main>
  );
}
