import React from 'react';
import { theme, mergeClassNames } from './theme';

// PUBLIC_INTERFACE
export const Button = React.forwardRef(function Button(
  {
    as = 'button',
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className,
    children,
    iconLeft,
    iconRight,
    ...props
  },
  ref
) {
  /** Accessible button with variants and sizes. */

  const base =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-5 py-2.5 text-base rounded-lg',
  };
  const variants = {
    primary: `bg-[${theme.colors.primary}] text-[${theme.colors.primaryText}] hover:brightness-95`,
    secondary: `bg-[${theme.colors.surface}] text-[${theme.colors.text}] border border-gray-300 hover:bg-gray-50`,
    danger: `bg-[${theme.colors.error}] text-white hover:brightness-95`,
    ghost: `bg-transparent text-[${theme.colors.text}] hover:bg-black/5`,
  };

  const Comp = as;

  return (
    <Comp
      ref={ref}
      type={as === 'button' ? type : undefined}
      className={mergeClassNames(
        base,
        sizes[size],
        variants[variant] || variants.primary,
        'focus-visible:ring-[color:var(--color-ring, rgba(37,99,235,0.5))] focus-visible:ring-offset-[color:var(--color-surface,#fff)]',
        disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      aria-disabled={disabled || loading}
      disabled={as === 'button' ? disabled || loading : undefined}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {iconLeft && <span className="mr-2" aria-hidden="true">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="ml-2" aria-hidden="true">{iconRight}</span>}
    </Comp>
  );
});
