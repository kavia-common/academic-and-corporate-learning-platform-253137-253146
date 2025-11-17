import React, { useEffect, useRef } from 'react';
import { mergeClassNames } from './theme';

/**
 * Trap focus within a container by cycling tab focus.
 * Returns a cleanup function to remove listeners.
 */
function trapFocus(container) {
  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;
    const focusable = container.querySelectorAll(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const list = Array.from(focusable);
    if (list.length === 0) return;

    const first = list[0];
    const last = list[list.length - 1];

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  }
  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
}

// PUBLIC_INTERFACE
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  initialFocusRef,
  labelledById,
  describedById,
}) {
  /**
   * Accessible modal dialog.
   * - role="dialog" with aria-modal
   * - Focus trap and return focus to opener
   * - Close on ESC and overlay click
   */

  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  // Manage focus
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement;
      const cleanupTrap = panelRef.current ? trapFocus(panelRef.current) : () => {};
      const toFocus = initialFocusRef?.current || panelRef.current;
      setTimeout(() => {
        toFocus?.focus();
      }, 0);

      function onKey(e) {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose?.();
        }
      }
      document.addEventListener('keydown', onKey);

      return () => {
        document.removeEventListener('keydown', onKey);
        cleanupTrap();
        // Restore focus to the opener
        lastActiveRef.current && lastActiveRef.current.focus?.();
      };
    }
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) {
      onClose?.();
    }
  }

  const titleId = labelledById || 'modal-title';
  const descId = describedById || undefined;

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-hidden="false"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={descId}
        tabIndex={-1}
        className={mergeClassNames(
          'bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 outline-none',
          className
        )}
      >
        {title && (
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
