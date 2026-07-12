import React from 'react'

const VARIANTS = {
  primary:   'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-slate-700  hover:bg-slate-600  text-slate-200',
  danger:    'bg-red-600    hover:bg-red-500    text-white',
  ghost:     'hover:bg-slate-800 text-slate-400 hover:text-slate-200',
  success:   'bg-emerald-600 hover:bg-emerald-500 text-white',
}

const SIZES = {
  sm:  'px-3 py-1.5 text-xs',
  md:  'px-4 py-2   text-sm',
  lg:  'px-5 py-2.5 text-base',
  icon:'p-2',
}

export default function Button({
  children, variant = 'primary', size = 'md', disabled, loading, className = '', ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </button>
  )
}
