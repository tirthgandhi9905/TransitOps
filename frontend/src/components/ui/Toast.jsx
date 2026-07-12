import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const TYPES = {
  success: {
    icon: CheckCircle,
    classes: 'bg-white border-emerald-200 text-emerald-700',
    iconClass: 'text-emerald-500',
  },
  error: {
    icon: XCircle,
    classes: 'bg-white border-red-200 text-red-700',
    iconClass: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-white border-amber-200 text-amber-700',
    iconClass: 'text-amber-500',
  },
  info: {
    icon: Info,
    classes: 'bg-white border-blue-200 text-blue-700',
    iconClass: 'text-blue-500',
  },
}

function Toast({ toast, onRemove }) {
  const { icon: Icon, classes, iconClass } = TYPES[toast.type] || TYPES.info
  return (
    <div className={`
      flex items-start gap-3 p-3.5 rounded-xl border shadow-toast max-w-sm
      ${classes}
    `}>
      <Icon size={16} className={`mt-0.5 flex-shrink-0 ${iconClass}`} />
      <p className="text-sm flex-1 font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-50 hover:opacity-100 flex-shrink-0 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map(t => <Toast key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  )
}