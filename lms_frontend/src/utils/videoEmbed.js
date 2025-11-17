//
// Utility helpers for handling video embedding and fallbacks without altering existing Drive behavior.
//

/**
 * PUBLIC_INTERFACE
 * isGoogleDriveLink
 * Determine if a URL appears to be a Google Drive share/preview link.
 */
export function isGoogleDriveLink(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.includes('drive.google.com') ||
      u.hostname.includes('docs.google.com')
    );
  } catch {
    return false;
  }
}

/**
 * PUBLIC_INTERFACE
 * getDrivePreviewEmbedUrl
 * Given a Drive URL, attempt to derive an embeddable preview URL.
 * Returns null if the URL is not recognized.
 */
export function getDrivePreviewEmbedUrl(url) {
  if (!isGoogleDriveLink(url)) return null;
  try {
    // Common patterns:
    // - https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing
    // - https://drive.google.com/open?id=<FILE_ID>
    // - https://drive.google.com/uc?export=download&id=<FILE_ID>
    const u = new URL(url);

    // Attempt to extract id
    let id = null;

    // /file/d/<id>/...
    const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch && fileMatch[1]) {
      id = fileMatch[1];
    }

    // open?id=<id>
    if (!id && u.searchParams.get('id')) {
      id = u.searchParams.get('id');
    }

    // uc?export=download&id=<id>
    if (!id && u.pathname.includes('/uc') && u.searchParams.get('id')) {
      id = u.searchParams.get('id');
    }

    if (!id) return null;

    return `https://drive.google.com/file/d/${id}/preview`;
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * canEmbedProvider
 * Simple heuristic to determine if we should attempt an embed.
 * Currently we only "recognize" Google Drive for embed in this app.
 */
export function canEmbedProvider(url) {
  return isGoogleDriveLink(url);
}
