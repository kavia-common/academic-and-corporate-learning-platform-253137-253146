export const theme = {
  colors: {
    primary: 'var(--color-primary, #2563EB)',
    primaryText: 'var(--color-primary-text, #ffffff)',
    secondary: 'var(--color-secondary, #F59E0B)',
    error: 'var(--color-error, #EF4444)',
    surface: 'var(--color-surface, #ffffff)',
    background: 'var(--color-background, #f9fafb)',
    text: 'var(--color-text, #111827)',
    muted: 'var(--color-muted, #6B7280)',
    ring: 'var(--color-ring, rgba(37, 99, 235, 0.5))'
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem'
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.08)',
    lg: '0 10px 15px rgba(0,0,0,0.10)'
  },
  spacing: (n) => `${0.25 * n}rem`,
};

// PUBLIC_INTERFACE
export function mergeClassNames(...classes) {
  /** Merge class names, filtering falsy values. */
  return classes.filter(Boolean).join(' ');
}
