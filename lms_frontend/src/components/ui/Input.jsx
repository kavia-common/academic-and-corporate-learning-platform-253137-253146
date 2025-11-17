import React, { useId } from 'react';
import { mergeClassNames } from './theme';

// PUBLIC_INTERFACE
export function Input({
  id,
  label,
  description,
  error,
  className,
  inputClassName,
  required,
  ...props
}) {
  /** Accessible text input with labeling and error messaging. */
  const autoId = useId();
  const inputId = id || autoId;
  const descId = description ? `${inputId}-desc` : undefined;
  const errId = error ? `${inputId}-err` : undefined;

  return (
    <div className={mergeClassNames('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
        aria-invalid={!!error}
        className={mergeClassNames(
          'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error ? 'border-red-500' : '',
          inputClassName
        )}
        required={required}
        {...props}
      />
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
