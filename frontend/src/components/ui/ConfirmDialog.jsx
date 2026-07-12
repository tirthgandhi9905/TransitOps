import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title, message, confirmLabel = 'Confirm',
  danger = false, loading
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3 mb-6">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${danger ? 'bg-red-50' : 'bg-amber-50'}
        `}>
          <AlertTriangle size={20} className={danger ? 'text-red-500' : 'text-amber-500'} />
        </div>
        <p className="text-gray-600 text-sm leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}