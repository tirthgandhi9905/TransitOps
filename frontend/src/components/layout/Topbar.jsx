import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, LogOut } from 'lucide-react'
import useAuth from '../../hooks/useAuth'

const PAGE_META = {
  '/dashboard':   { title: 'Dashboard',          sub: 'Fleet overview & KPIs' },
  '/vehicles':    { title: 'Vehicle Registry',    sub: 'Manage your fleet assets' },
  '/drivers':     { title: 'Driver Management',   sub: 'Driver profiles & compliance' },
  '/trips':       { title: 'Trip Management',     sub: 'Dispatch & track deliveries' },
  '/maintenance': { title: 'Maintenance',         sub: 'Service logs & scheduling' },
  '/fuel':        { title: 'Fuel & Expenses',     sub: 'Operational cost tracking' },
  '/reports':     { title: 'Reports & Analytics', sub: 'Performance insights' },
  '/users':       { title: 'User Management',     sub: 'Accounts & roles' },
}

export default function Topbar({ onMenuClick }) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const meta = PAGE_META[location.pathname] || { title: 'TransitOps', sub: '' }

  return (
    <header className="h-16 bg-white border-b border-surface-border flex items-center justify-between px-5 flex-shrink-0">
      {/* Left: Page title */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-gray-900 font-semibold text-[15px] leading-tight truncate">{meta.title}</h1>
          {meta.sub && (
            <p className="text-gray-400 text-xs leading-tight hidden sm:block">{meta.sub}</p>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell size={17} />
        </button>

        <div className="w-px h-5 bg-surface-border mx-1" />

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-gray-800 text-xs font-semibold leading-none">{user?.name}</p>
            <p className="text-gray-400 text-xs mt-0.5 leading-none">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <button
            onClick={logoutUser}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}