import React from 'react';

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Log In to TransitOps</h2>
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white" />
          <input type="password" placeholder="Password" className="w-full bg-slate-800 border border-slate-700 p-2 rounded text-white" />
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded">Log In</button>
        </div>
      </div>
    </div>
  );
}
