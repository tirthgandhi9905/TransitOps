import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Table({
  columns, data, loading, emptyMessage = 'No records found.',
  sortBy, sortOrder, onSort, currentPage = 1, totalPages = 1, onPageChange,
}) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-muted">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
                    first:rounded-tl-none last:rounded-tr-none
                    ${col.sortable ? 'cursor-pointer hover:text-gray-800 select-none' : ''}
                    ${col.className || ''}
                  `}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortBy === col.key
                        ? sortOrder === 'asc'
                          ? <ChevronUp size={11} className="text-brand-600" />
                          : <ChevronDown size={11} className="text-brand-600" />
                        : <ChevronsUpDown size={11} className="opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {!data?.length ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <p className="text-gray-400 text-sm">{emptyMessage}</p>
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr
                key={row.id || i}
                className="hover:bg-surface-muted/60 transition-colors"
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 text-gray-700 ${col.className || ''}`}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? <span className="text-gray-300">—</span>)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
          <p className="text-xs text-gray-400 tabular-nums">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-surface-border
                bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={12} /> Prev
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-surface-border
                bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}