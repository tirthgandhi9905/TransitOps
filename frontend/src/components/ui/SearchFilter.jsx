import React from 'react'
import { Search } from 'lucide-react'

export default function SearchFilter({ search, onSearch, filters = [], className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search…"
          className="pl-8 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-100
            placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
        />
      </div>

      {filters.map(f => (
        <select
          key={f.key}
          value={f.value}
          onChange={e => f.onChange(e.target.value)}
          className="text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
