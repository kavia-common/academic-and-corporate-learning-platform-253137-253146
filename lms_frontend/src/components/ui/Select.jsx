import React, { useId } from 'react';
import { mergeClassNames } from './theme';

// PUBLIC_INTERFACE
export function Select({
  id,
  label,
  description,
  error,
  className,
  selectClassName,
  children,
  required,
  ...props
}) {
  /** Accessible select with labeling and error messaging. */
  const autoId = useId();
  const selectId = id || autoId;
  const descId = description ? `${selectId}-desc` : undefined;
  const errId = error ? `${selectId}-err` : undefined;

  return (
    <div className={mergeClassNames('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <select
        id={selectId}
        aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
        aria-invalid={!!error}
        className={mergeClassNames(
          'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error ? 'border-red-500' : '',
          selectClassName
        )}
        required={required}
        {...props}
      >
        {children}
      </select>
      {description && (
        <p id={descId} className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
