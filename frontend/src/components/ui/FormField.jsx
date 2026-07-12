import React from 'react'

export default function FormField({ label, error, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100
        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100
        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        disabled:opacity-50 resize-none ${className}`}
      {...props}
    />
  )
}
