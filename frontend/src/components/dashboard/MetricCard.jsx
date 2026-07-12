import React from 'react';

export default function MetricCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      {Icon && <Icon className="w-8 h-8 text-indigo-500 opacity-80" />}
    </div>
  );
}
