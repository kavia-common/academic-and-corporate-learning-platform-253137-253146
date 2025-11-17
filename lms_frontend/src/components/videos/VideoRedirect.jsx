import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * VideoRedirect
 * 
 * A minimal component that navigates the user to a provided videoUrl.
 * Intended for cases where embedding is blocked or when the user explicitly
 * chooses to open the video externally.
 *
 * Props:
 * - videoUrl: string - The absolute URL to redirect to.
 * - replace: boolean - If true, uses location.replace to avoid adding a history entry.
 *
 * Behavior:
 * - On mount, attempts to open the URL in a new tab/window if popup blockers allow,
 *   otherwise falls back to setting window.location (same tab).
 */
export default function VideoRedirect({ videoUrl, replace = false }) {
  useEffect(() => {
    if (!videoUrl) return;

    try {
      // Try to open in new tab for better UX; fallback to same-tab navigation if blocked.
      const win = window.open(videoUrl, '_blank', 'noopener,noreferrer');
      if (win && typeof win.focus === 'function') {
        win.focus();
      } else {
        if (replace) {
          window.location.replace(videoUrl);
        } else {
          window.location.href = videoUrl;
        }
      }
    } catch (e) {
      // Last-resort fallback
      if (replace) {
        window.location.replace(videoUrl);
      } else {
        window.location.href = videoUrl;
      }
    }
  }, [videoUrl, replace]);

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-gray-700 mb-2">Redirecting to the video...</p>
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Click here if you are not redirected
          </a>
        ) : (
          <span className="text-red-600">No video URL provided.</span>
        )}
      </div>
    </div>
  );
}

VideoRedirect.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  replace: PropTypes.bool,
};
