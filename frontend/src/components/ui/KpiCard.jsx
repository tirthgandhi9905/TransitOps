import React from 'react'

const colorMap = {
  brand:   { bar: 'bg-brand-600',   icon: 'text-brand-600 bg-brand-50',    num: 'text-brand-700'  },
  emerald: { bar: 'bg-emerald-500', icon: 'text-emerald-600 bg-emerald-50', num: 'text-emerald-700'},
  amber:   { bar: 'bg-amber-500',   icon: 'text-amber-600 bg-amber-50',     num: 'text-amber-700'  },
  red:     { bar: 'bg-red-500',     icon: 'text-red-600 bg-red-50',         num: 'text-red-700'    },
  blue:    { bar: 'bg-blue-500',    icon: 'text-blue-600 bg-blue-50',       num: 'text-blue-700'   },
  slate:   { bar: 'bg-gray-400',    icon: 'text-gray-500 bg-gray-100',      num: 'text-gray-700'   },
  // alias
  indigo:  { bar: 'bg-brand-600',   icon: 'text-brand-600 bg-brand-50',     num: 'text-brand-700'  },
}

export default function KpiCard({ label, value, icon: Icon, sub, color = 'brand' }) {
  const c = colorMap[color] || colorMap.brand

  return (
    <div className="bg-white rounded-xl shadow-card border border-surface-border overflow-hidden">
      {/* Colored top accent */}
      <div className={`h-0.5 w-full ${c.bar}`} />

      <div className="p-4 flex items-start gap-3">
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide truncate">{label}</p>
          <p className={`text-2xl font-bold mt-0.5 tabular-nums ${c.num}`}>{value ?? '—'}</p>
          {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}