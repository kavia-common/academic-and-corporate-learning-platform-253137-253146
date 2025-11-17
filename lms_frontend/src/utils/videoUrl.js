/**
 * PUBLIC_INTERFACE
 * convertDriveLink normalizes Google Drive links into a preview-friendly URL that is safe for iframe embedding.
 *
 * Supported input patterns (examples):
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/file/d/FILE_ID/view?usp=share_link
 * - https://drive.google.com/uc?id=FILE_ID&export=download
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - https://drive.google.com/open?id=FILE_ID
 *
 * Returns:
 * - https://drive.google.com/file/d/FILE_ID/preview for recognized patterns
 * - The original URL if not recognized or not a Drive link (non-strict usage)
 *
 * Note:
 * - Inline sanity: if url is not a string, returns the input as-is to avoid throwing at call sites.
 */
export function convertDriveLink(url) {
  if (typeof url !== 'string') return url;
  // Attempt to parse; if invalid, exit early
  let u;
  try {
    u = new URL(url);
  } catch {
    return url;
  }

  // Only handle *.drive.google.com hosts
  const isDrive = /(^|\.)drive\.google\.com$/i.test(u.hostname);
  if (!isDrive) return url;

  // Try to extract FILE_ID from supported path/query formats
  // 1) /file/d/FILE_ID/(view|preview)
  const pathMatch = u.pathname.match(/\/file\/d\/([^/]+)\/(view|preview)?/i);
  if (pathMatch && pathMatch[1]) {
    const fileId = pathMatch[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // 2) /open?id=FILE_ID
  if (u.pathname === '/open') {
    const id = u.searchParams.get('id');
    if (id) {
      return `https://drive.google.com/file/d/${id}/preview`;
    }
  }

  // 3) /uc?id=FILE_ID or /uc?export=view&id=FILE_ID
  if (u.pathname === '/uc') {
    const id = u.searchParams.get('id');
    if (id) {
      return `https://drive.google.com/file/d/${id}/preview`;
    }
  }

  // If no supported patterns match, return original to avoid breaking non-Drive or edge cases
  return url;
}

/**
 * PUBLIC_INTERFACE
 * isGoogleDriveUrl checks whether a URL points to Google Drive.
 * Kept separately for light checks in form flows.
 */
export function isGoogleDriveUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return /(^|\.)drive\.google\.com$/i.test(u.hostname);
  } catch {
    return false;
  }
}

/**
 * PUBLIC_INTERFACE
 * toEmbedUrl converts known provider URLs to embeddable versions.
 * For Drive we delegate to convertDriveLink. Returns null if unchanged from
 * original and not embeddable (used to branch UI to a simple link).
 */
export function toEmbedUrl(url) {
  if (typeof url !== 'string') return null;
  const converted = convertDriveLink(url);
  // If conversion didn't change anything and it's not a Drive URL, no embed
  if (converted === url && !isGoogleDriveUrl(url)) return null;
  return converted;
}
