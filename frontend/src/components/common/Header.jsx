import React from 'react';

export default function Header() {
  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-slate-100 font-medium">Operations Console</h1>
      <button className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md">Log Out</button>
    </div>
  );
}
