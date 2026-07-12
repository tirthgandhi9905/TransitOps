import React from 'react'

export default function KpiCard({ label, value, icon: Icon, sub, color = 'indigo' }) {
  const colorMap = {
    indigo:  'text-indigo-400 bg-indigo-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber:   'text-amber-400  bg-amber-500/10',
    red:     'text-red-400    bg-red-500/10',
    blue:    'text-blue-400   bg-blue-500/10',
    slate:   'text-slate-400  bg-slate-500/10',
  }
  const c = colorMap[color] || colorMap.indigo

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${c}`}>
          <Icon size={20} className={c.split(' ')[0]} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
