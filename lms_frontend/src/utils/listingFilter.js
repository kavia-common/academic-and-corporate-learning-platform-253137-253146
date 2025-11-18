//
// PUBLIC INTERFACE
// Centralized filtering utilities for course/path listings to exclude specific items by title or slug.
//
/**
 * PUBLIC_INTERFACE
 * shouldExcludeItem determines whether an item should be excluded based on title or slug criteria.
 *
 * @param {Object} item - Item object which may contain title, name, id, slug, or key.
 * @param {Object} [options]
 * @param {string[]} [options.excludedTitles] - Case-insensitive titles to exclude.
 * @param {string[]} [options.excludedSlugs] - Case-insensitive slugs/ids/keys to exclude.
 * @returns {boolean} true if the item should be filtered out
 */
export function shouldExcludeItem(item, options = {}) {
  const { excludedTitles = [], excludedSlugs = [] } = options;

  const title = String(item?.title || item?.name || '').trim().toLowerCase();
  const slugCandidates = [
    item?.slug,
    item?.id,
    item?.key,
    item?.path_id,
  ]
    .map((v) => (v === undefined || v === null ? '' : String(v)))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const titleSet = new Set(excludedTitles.map((t) => String(t).trim().toLowerCase()));
  const slugSet = new Set(excludedSlugs.map((s) => String(s).trim().toLowerCase()));

  if (title && titleSet.has(title)) return true;

  for (const s of slugCandidates) {
    if (slugSet.has(s)) return true;
  }
  return false;
}

/**
 * PUBLIC_INTERFACE
 * filterList applies shouldExcludeItem over an array defensively.
 *
 * @param {Array<any>} list
 * @param {Object} options - see shouldExcludeItem
 * @returns {Array<any>} filtered list
 */
export function filterList(list, options = {}) {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => !shouldExcludeItem(item, options));
}

/**
 * PUBLIC_INTERFACE
 * getDefaultExclusions returns the default titles/slugs we should exclude globally.
 * Central source of truth so we don't hardcode across components.
 */
export function getDefaultExclusions() {
  return {
    excludedTitles: ['Full Web Development Learning Path'],
    excludedSlugs: ['full_web_dev'],
  };
}
