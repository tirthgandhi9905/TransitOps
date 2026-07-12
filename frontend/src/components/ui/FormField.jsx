import React from 'react'

export default function FormField({ label, error, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const BASE_INPUT = `
  w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-900
  placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
  disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed
  transition-shadow
`

export function Input({ className = '', ...props }) {
  return (
    <input className={`${BASE_INPUT} ${className}`} {...props} />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${BASE_INPUT} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`${BASE_INPUT} resize-none ${className}`}
      {...props}
    />
  )
}