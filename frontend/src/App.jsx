import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import useAuth from './hooks/useAuth'

// Pages
import Login            from './pages/Login'
import Dashboard        from './pages/Dashboard'
import VehicleRegistry  from './pages/VehicleRegistry'
import DriverManagement from './pages/DriverManagement'
import TripManagement   from './pages/TripManagement'
import Maintenance      from './pages/Maintenance'
import FuelExpenses     from './pages/FuelExpenses'
import Reports          from './pages/Reports'

// Layout
import AppLayout from './components/layout/AppLayout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-400 animate-pulse">Loading…</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="vehicles"    element={<VehicleRegistry />} />
        <Route path="drivers"     element={<DriverManagement />} />
        <Route path="trips"       element={<TripManagement />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="fuel"        element={<FuelExpenses />} />
        <Route path="reports"     element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
