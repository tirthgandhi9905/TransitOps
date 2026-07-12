import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, MapPin,
  Wrench, Fuel, BarChart3, UserCog,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { PAGE_ACCESS } from '../../utils/constants'

// TransitOps logo mark — recreated from brand assets
function TransitOpsLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" stroke="#7C2D84" strokeWidth="3"/>
      <circle cx="16" cy="16" r="4.5" fill="#7C2D84"/>
      <rect x="11.5" y="28" width="9" height="2.5" rx="1.25" fill="#7C2D84" opacity="0.35"/>
    </svg>
  )
}

const NAV_ITEMS = [
  { label: 'Dashboard',       path: '/dashboard',   icon: LayoutDashboard, page: 'Dashboard'   },
  { label: 'Vehicles',        path: '/vehicles',    icon: Truck,            page: 'Vehicles'    },
  { label: 'Drivers',         path: '/drivers',     icon: Users,            page: 'Drivers'     },
  { label: 'Trips',           path: '/trips',       icon: MapPin,           page: 'Trips'       },
  { label: 'Maintenance',     path: '/maintenance', icon: Wrench,           page: 'Maintenance' },
  { label: 'Fuel & Expenses', path: '/fuel',        icon: Fuel,             page: 'Fuel'        },
  { label: 'Reports',         path: '/reports',     icon: BarChart3,        page: 'Reports'     },
  { label: 'Users',           path: '/users',       icon: UserCog,          page: 'Users'       },
]

export default function Sidebar({ open, onToggle }) {
  const { user } = useAuth()
  const role = user?.role

  const visible = NAV_ITEMS.filter(item =>
    role && PAGE_ACCESS[item.page]?.[role]
  )

  return (
    <aside className={`
      flex flex-col bg-white border-r border-surface-border
      transition-all duration-300 flex-shrink-0
      ${open ? 'w-56' : 'w-[60px]'}
    `}>
      {/* Logo */}
      <div className={`
        flex items-center h-16 border-b border-surface-border flex-shrink-0
        ${open ? 'px-4 gap-3' : 'px-0 justify-center'}
      `}>
        <TransitOpsLogo size={28} />
        {open && (
          <span className="font-bold text-gray-900 tracking-tight" style={{ fontSize: '15px', letterSpacing: '-0.01em' }}>
            transit<span className="text-brand-600">Ops</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-hidden space-y-0.5">
        {visible.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={!open ? label : undefined}
            className={({ isActive }) => `
              relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors
              ${open ? 'px-3 py-2.5' : 'justify-center py-2.5 px-0'}
              ${isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-600 rounded-r-full" />
                )}
                <Icon size={17} className="flex-shrink-0" />
                {open && <span className="truncate leading-none">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user chip + collapse */}
      {open && user && (
        <div className="px-3 py-3 border-t border-surface-border">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-surface-muted">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 text-xs font-semibold truncate leading-none">{user.name}</p>
              <p className="text-gray-400 text-xs mt-0.5 truncate leading-none">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={`
          flex items-center justify-center h-10 border-t border-surface-border
          text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0
        `}
        title={open ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
      </button>
    </aside>
  )
}