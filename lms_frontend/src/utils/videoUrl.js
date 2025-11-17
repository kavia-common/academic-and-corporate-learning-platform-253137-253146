//
// PUBLIC INTERFACE
// Video URL utilities: detect/normalize Google Drive links for safe iframe embedding.
//

/**
 * PUBLIC_INTERFACE
 * Checks if a URL belongs to Google Drive file sharing.
 * Supports common variations:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/file/d/FILE_ID/view?usp=share_link
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID&export=download
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isGoogleDriveUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return /(^|\.)drive\.google\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}

/**
 * PUBLIC_INTERFACE
 * Extracts the FILE_ID from supported Google Drive URL formats.
 * @param {string} url
 * @returns {string|null} FILE_ID or null if not found
 */
export function extractDriveFileId(url) {
  if (!isGoogleDriveUrl(url)) return null;
  try {
    const u = new URL(url);

    // 1) /file/d/FILE_ID/(view|preview)
    const pathMatch = u.pathname.match(/\/file\/d\/([^/]+)\/(view|preview)?/i);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }

    // 2) /open?id=FILE_ID
    if (u.pathname === '/open') {
      const id = u.searchParams.get('id');
      if (id) return id;
    }

    // 3) /uc?id=FILE_ID or /uc?export=view&id=FILE_ID
    if (u.pathname === '/uc') {
      const id = u.searchParams.get('id');
      if (id) return id;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * Normalizes a Google Drive URL to preview format:
 * https://drive.google.com/file/d/FILE_ID/preview
 *
 * If the URL is not a Drive URL or FILE_ID cannot be parsed, the original URL is returned
 * unless strict is true, in which case null is returned.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {boolean} [options.strict=false] - when true, returns null if not a recognizable Drive URL
 * @returns {string|null}
 */
export function normalizeDriveUrl(url, options = {}) {
  const { strict = false } = options;
  if (typeof url !== 'string') return strict ? null : url;

  const fileId = extractDriveFileId(url);
  if (!fileId) {
    return strict ? null : url;
  }
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * PUBLIC_INTERFACE
 * Produces an embeddable URL for supported providers.
 * Currently supports Google Drive by returning the preview URL.
 * For other providers, returns null to indicate fallback to a regular link.
 *
 * @param {string} url
 * @returns {string|null}
 */
export function toEmbedUrl(url) {
  if (typeof url !== 'string') return null;

  // Google Drive
  if (isGoogleDriveUrl(url)) {
    const norm = normalizeDriveUrl(url, { strict: true });
    return norm; // may be null if failed
  }

  // Other providers can be added here (YouTube, Vimeo, etc.)
  return null;
}
