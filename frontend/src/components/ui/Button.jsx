import React from 'react'

const VARIANTS = {
  primary:   'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-surface-border shadow-sm',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
  ghost:     'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  outline:   'border border-brand-600 text-brand-600 hover:bg-brand-50',
}

const SIZES = {
  sm:   'px-3 py-1.5 text-xs gap-1.5',
  md:   'px-4 py-2 text-sm gap-2',
  lg:   'px-5 py-2.5 text-[15px] gap-2',
  icon: 'p-2',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  disabled, loading, className = '', ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </button>
  )
}