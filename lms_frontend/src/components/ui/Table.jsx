import React from 'react';
import { mergeClassNames } from './theme';

// PUBLIC_INTERFACE
export function Table({ columns = [], data = [], className, caption }) {
  /**
   * Accessible table with optional caption.
   * columns: [{ key, header, className }]
   * data: array of rows (objects) matching column keys
   */
  return (
    <div className={mergeClassNames('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={mergeClassNames(
                  'px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
