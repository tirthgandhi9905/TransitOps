import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }     from './context/AuthContext'
import { ToastContext }     from './hooks/useToast'
import { useToastProvider } from './hooks/useToast'
import ToastContainer       from './components/ui/Toast'
import useAuth              from './hooks/useAuth'

// Layout
import AppLayout from './components/layout/AppLayout'

// Pages
import Login            from './pages/Login'
import Dashboard        from './pages/Dashboard'
import VehicleRegistry  from './pages/VehicleRegistry'
import DriverManagement from './pages/DriverManagement'
import TripManagement   from './pages/TripManagement'
import Maintenance      from './pages/Maintenance'
import FuelExpenses     from './pages/FuelExpenses'
import Reports          from './pages/Reports'

// ─── Loading spinner shown during JWT re-hydration ───────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    </div>
  )
}

// ─── Guards ──────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

// ─── Route tree ──────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index                  element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"       element={<Dashboard />} />
        <Route path="vehicles"        element={<VehicleRegistry />} />
        <Route path="drivers"         element={<DriverManagement />} />
        <Route path="trips"           element={<TripManagement />} />
        <Route path="maintenance"     element={<Maintenance />} />
        <Route path="fuel"            element={<FuelExpenses />} />
        <Route path="reports"         element={<Reports />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// ─── Toast provider wrapper (must be inside BrowserRouter) ───────────────────
function ToastProvider({ children }) {
  const { toasts, addToast, removeToast } = useToastProvider()
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}