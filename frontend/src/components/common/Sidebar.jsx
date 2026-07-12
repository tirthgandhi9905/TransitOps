import React from 'react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 p-4">
      <h2 className="text-xl font-bold text-white mb-6">TransitOps</h2>
      <div className="space-y-2 text-slate-400">
        <p>Dashboard</p>
        <p>Vehicles</p>
        <p>Drivers</p>
        <p>Trips</p>
        <p>Maintenance</p>
        <p>Reports</p>
      </div>
    </div>
  );
}
