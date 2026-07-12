import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export default function Table({
  columns, data, loading, emptyMessage = 'No records found.',
  sortBy, sortOrder, onSort, currentPage = 1, totalPages = 1, onPageChange,
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide
                    ${col.sortable ? 'cursor-pointer hover:text-slate-200 select-none' : ''}
                    ${col.className || ''}`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortBy === col.key
                        ? sortOrder === 'asc'
                          ? <ChevronUp size={12} />
                          : <ChevronDown size={12} />
                        : <ChevronsUpDown size={12} className="opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!data?.length ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr key={row.id || i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 text-slate-300 ${col.className || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-xs rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
            >Prev</button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 text-xs rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
