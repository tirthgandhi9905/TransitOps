import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, MapPin,
  Wrench, Fuel, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { PAGE_ACCESS } from '../../utils/constants'

const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard, page: 'Dashboard'   },
  { label: 'Vehicles',    path: '/vehicles',    icon: Truck,            page: 'Vehicles'    },
  { label: 'Drivers',     path: '/drivers',     icon: Users,            page: 'Drivers'     },
  { label: 'Trips',       path: '/trips',       icon: MapPin,           page: 'Trips'       },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench,           page: 'Maintenance' },
  { label: 'Fuel & Expenses', path: '/fuel',   icon: Fuel,             page: 'Fuel'        },
  { label: 'Reports',     path: '/reports',     icon: BarChart3,        page: 'Reports'     },
]

export default function Sidebar({ open, onToggle }) {
  const { user } = useAuth()
  const role = user?.role

  const visible = NAV_ITEMS.filter(item =>
    role && PAGE_ACCESS[item.page]?.[role]
  )

  return (
    <aside className={`
      flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-shrink-0
      ${open ? 'w-56' : 'w-16'}
    `}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Truck size={16} className="text-white" />
        </div>
        {open && <span className="text-white font-bold text-sm tracking-wide">TransitOps</span>}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-hidden">
        {visible.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
            `}
          >
            <Icon size={18} className="flex-shrink-0" />
            {open && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
      >
        {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  )
}
