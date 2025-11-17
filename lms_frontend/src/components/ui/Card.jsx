import React from 'react';
import { mergeClassNames } from './theme';

// PUBLIC_INTERFACE
export function Card({ className, children, ...props }) {
  /** Surface card container. */
  return (
    <section
      className={mergeClassNames(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

// PUBLIC_INTERFACE
export function CardHeader({ className, children, ...props }) {
  /** Card header region. */
  return (
    <header
      className={mergeClassNames('px-4 py-3 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </header>
  );
}

// PUBLIC_INTERFACE
export function CardBody({ className, children, ...props }) {
  /** Main card content region. */
  return (
    <div className={mergeClassNames('px-4 py-4', className)} {...props}>
      {children}
    </div>
  );
}

// PUBLIC_INTERFACE
export function CardFooter({ className, children, ...props }) {
  /** Card footer region. */
  return (
    <footer
      className={mergeClassNames('px-4 py-3 border-t border-gray-200', className)}
      {...props}
    >
      {children}
    </footer>
  );
}
