import { createContext, useContext, useState, useCallback } from 'react'

// Module-level setter — populated once ToastProvider mounts
let _dispatch = null

// Call this from anywhere — pages, api error handlers, etc.
export function toast(message, type = 'info') {
  if (_dispatch) _dispatch(message, type)
}

export const ToastContext = createContext(null)

export function useToastProvider() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  // Wire the global shortcut
  _dispatch = addToast

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

// Hook for components that need addToast directly
export default function useToast() {
  return useContext(ToastContext)
}