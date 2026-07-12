import React from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Bell, LogOut } from 'lucide-react'
import useAuth from '../../hooks/useAuth'

const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/vehicles':    'Vehicle Registry',
  '/drivers':     'Driver Management',
  '/trips':       'Trip Management',
  '/maintenance': 'Maintenance',
  '/fuel':        'Fuel & Expenses',
  '/reports':     'Reports & Analytics',
}

export default function Topbar({ onMenuClick }) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'TransitOps'

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-slate-100 font-semibold text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-slate-200 text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-slate-500 text-xs mt-0.5">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <button
            onClick={logoutUser}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
