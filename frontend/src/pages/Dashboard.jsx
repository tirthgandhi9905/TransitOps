import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Operations Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Metric Cards will render here */}
      </div>
    </div>
  );
}
