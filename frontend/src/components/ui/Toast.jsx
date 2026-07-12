import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const TYPES = {
  success: { icon: CheckCircle, classes: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  error:   { icon: XCircle,     classes: 'bg-red-500/10     border-red-500/20     text-red-400'     },
  warning: { icon: AlertTriangle,classes: 'bg-amber-500/10  border-amber-500/20   text-amber-400'   },
  info:    { icon: Info,         classes: 'bg-blue-500/10   border-blue-500/20    text-blue-400'    },
}

function Toast({ toast, onRemove }) {
  const { icon: Icon, classes } = TYPES[toast.type] || TYPES.info
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${classes} shadow-lg max-w-sm`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <p className="text-sm flex-1 text-slate-200">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-slate-400 hover:text-slate-200 flex-shrink-0">
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
