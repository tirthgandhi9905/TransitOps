export const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP:   'ON_TRIP',
  IN_SHOP:   'IN_SHOP',
  RETIRED:   'RETIRED',
}

export const DRIVER_STATUS = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP:   'ON_TRIP',
  OFF_DUTY:  'OFF_DUTY',
  SUSPENDED: 'SUSPENDED',
}

export const TRIP_STATUS = {
  DRAFT:       'DRAFT',
  DISPATCHED:  'DISPATCHED',
  COMPLETED:   'COMPLETED',
  CANCELLED:   'CANCELLED',
}

export const MAINTENANCE_STATUS = {
  ACTIVE:    'ACTIVE',
  COMPLETED: 'COMPLETED',
}

export const ROLES = {
  FLEET_MANAGER:     'Fleet Manager',
  DISPATCHER:        'Dispatcher',
  SAFETY_OFFICER:    'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
  ADMIN:             'Admin',
}

// Which pages each role can access: 'full' | 'view' | false
export const PAGE_ACCESS = {
  Dashboard:    { 'Fleet Manager': 'full', Dispatcher: 'full', 'Safety Officer': 'full', 'Financial Analyst': 'full', Admin: 'full' },
  Vehicles:     { 'Fleet Manager': 'full', Dispatcher: 'view', 'Safety Officer': false,  'Financial Analyst': 'view', Admin: 'full' },
  Drivers:      { 'Fleet Manager': 'full', Dispatcher: 'view', 'Safety Officer': 'full', 'Financial Analyst': false,  Admin: 'full' },
  Trips:        { 'Fleet Manager': 'view', Dispatcher: 'full', 'Safety Officer': 'view', 'Financial Analyst': 'view', Admin: 'full' },
  Maintenance:  { 'Fleet Manager': 'full', Dispatcher: false,  'Safety Officer': false,  'Financial Analyst': 'view', Admin: 'full' },
  Fuel:         { 'Fleet Manager': 'view', Dispatcher: false,  'Safety Officer': false,  'Financial Analyst': 'full', Admin: 'full' },
  Reports:      { 'Fleet Manager': 'view', Dispatcher: false,  'Safety Officer': 'view', 'Financial Analyst': 'full', Admin: 'full' },
  Users:        { 'Fleet Manager': false,  Dispatcher: false,  'Safety Officer': false,  'Financial Analyst': false,  Admin: 'full' },
}

// Status → Tailwind color classes
export const STATUS_BADGE_CLASSES = {
  AVAILABLE:   'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
  ON_TRIP:     'bg-indigo-500/20  text-indigo-400  ring-1 ring-indigo-500/30',
  IN_SHOP:     'bg-amber-500/20   text-amber-400   ring-1 ring-amber-500/30',
  RETIRED:     'bg-slate-500/20   text-slate-400   ring-1 ring-slate-500/30',
  OFF_DUTY:    'bg-slate-500/20   text-slate-400   ring-1 ring-slate-500/30',
  SUSPENDED:   'bg-red-500/20     text-red-400     ring-1 ring-red-500/30',
  DRAFT:       'bg-slate-500/20   text-slate-400   ring-1 ring-slate-500/30',
  DISPATCHED:  'bg-blue-500/20    text-blue-400    ring-1 ring-blue-500/30',
  COMPLETED:   'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
  CANCELLED:   'bg-red-500/20     text-red-400     ring-1 ring-red-500/30',
  ACTIVE:      'bg-amber-500/20   text-amber-400   ring-1 ring-amber-500/30',
}

export const VEHICLE_TYPES = ['VAN', 'TRUCK', 'BUS', 'BIKE', 'CAR', 'TRAILER']
export const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E']
export const MAINTENANCE_TYPES = ['OIL_CHANGE', 'TYRE_REPLACEMENT', 'BRAKE_SERVICE', 'ENGINE_REPAIR', 'GENERAL_SERVICE', 'BODY_REPAIR', 'OTHER']
export const EXPENSE_TYPES = ['TOLL', 'PARKING', 'INSURANCE', 'FINE', 'OTHER']
