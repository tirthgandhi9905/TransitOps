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

// Light-mode status badge classes — solid, high-contrast
export const STATUS_BADGE_CLASSES = {
  AVAILABLE:   'bg-emerald-50  text-emerald-700  ring-1 ring-emerald-200',
  ON_TRIP:     'bg-brand-50    text-brand-700    ring-1 ring-brand-200',
  IN_SHOP:     'bg-amber-50    text-amber-700    ring-1 ring-amber-200',
  RETIRED:     'bg-gray-100    text-gray-600     ring-1 ring-gray-200',
  OFF_DUTY:    'bg-gray-100    text-gray-600     ring-1 ring-gray-200',
  SUSPENDED:   'bg-red-50      text-red-700      ring-1 ring-red-200',
  DRAFT:       'bg-gray-100    text-gray-600     ring-1 ring-gray-200',
  DISPATCHED:  'bg-blue-50     text-blue-700     ring-1 ring-blue-200',
  COMPLETED:   'bg-emerald-50  text-emerald-700  ring-1 ring-emerald-200',
  CANCELLED:   'bg-red-50      text-red-700      ring-1 ring-red-200',
  ACTIVE:      'bg-amber-50    text-amber-700    ring-1 ring-amber-200',
}

export const VEHICLE_TYPES       = ['VAN', 'TRUCK', 'BUS', 'BIKE', 'CAR', 'TRAILER']
export const LICENSE_CATEGORIES  = ['A', 'B', 'C', 'D', 'E']
export const MAINTENANCE_TYPES   = ['OIL_CHANGE', 'TYRE_REPLACEMENT', 'BRAKE_SERVICE', 'ENGINE_REPAIR', 'GENERAL_SERVICE', 'BODY_REPAIR', 'OTHER']
export const EXPENSE_TYPES       = ['TOLL', 'PARKING', 'INSURANCE', 'FINE', 'OTHER']