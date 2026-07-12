import React from 'react'
import { Search } from 'lucide-react'

export default function SearchFilter({ search, onSearch, filters = [], className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* Search input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search…"
          className="pl-8 pr-4 py-2 text-sm bg-white border border-surface-border rounded-lg
            text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            w-52 transition-shadow"
        />
      </div>

      {/* Filter dropdowns */}
      {filters.map(f => (
        <select
          key={f.key}
          value={f.value}
          onChange={e => f.onChange(e.target.value)}
          className="text-sm bg-white border border-surface-border rounded-lg px-3 py-2 text-gray-700
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
        >
          <option value="">{f.placeholder || `All ${f.key}`}</option>
          {f.options.map(o => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
      ))}
    </div>
  )
}