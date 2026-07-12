import React from 'react'
import {
  Truck, Users, MapPin, Wrench, Activity,
  Clock, AlertTriangle, TrendingUp, CheckCircle
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import KpiCard    from '../components/ui/KpiCard'
import StatusBadge from '../components/ui/StatusBadge'
import useApi     from '../hooks/useApi'
import { getDashboardKpis, getDashboardAlerts, getDashboardCharts } from '../api/dashboard'
import { formatDate } from '../utils/helpers'

// Brand-aligned chart palette
const CHART_COLORS = ['#7C2D84','#10B981','#F59E0B','#3B82F6','#6B7280']

// Light-mode Recharts tooltip config
const TOOLTIP = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid #E4E8EF',
    borderRadius: 10,
    boxShadow: '0 4px 16px rgba(17,24,39,0.10)',
    fontSize: 12,
  },
  labelStyle: { color: '#6B7280', fontWeight: 600 },
  itemStyle:  { color: '#374151' },
}

function Skeleton({ h = 'h-10' }) {
  return <div className={`${h} bg-gray-100 animate-pulse rounded-lg`} />
}

function SectionCard({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-surface-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const { data: kpisRes,   loading: kLoading } = useApi(getDashboardKpis)
  const { data: alertsRes, loading: aLoading } = useApi(getDashboardAlerts)
  const { data: chartsRes, loading: cLoading } = useApi(getDashboardCharts)

  const kpis   = kpisRes?.data   || {}
  const alerts = alertsRes?.data || {}
  const charts = chartsRes?.data || {}

  const tripsByStatus  = charts.tripsByStatus  || []
  const vehiclesByType = charts.vehiclesByType || []
  const recentTrips    = charts.recentTrips    || []

  const expiringLicenses = alerts.expiringLicenses || []
  const longMaintenance  = alerts.longMaintenance  || []
  const totalAlerts      = expiringLicenses.length + longMaintenance.length

  return (
    <div className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kLoading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-card border border-surface-border p-4">
              <Skeleton h="h-4" />
              <div className="mt-3"><Skeleton h="h-7" /></div>
            </div>
          ))
        ) : (
          <>
            <KpiCard label="Total Vehicles"    value={kpis.totalVehicles}    icon={Truck}     color="brand"   />
            <KpiCard label="Available"         value={kpis.availableVehicles} icon={Truck}    color="emerald" />
            <KpiCard label="On Trip"           value={kpis.onTripVehicles}   icon={Activity}  color="blue"    />
            <KpiCard label="In Maintenance"    value={kpis.inShopVehicles}   icon={Wrench}    color="amber"   />
            <KpiCard label="Active Trips"      value={kpis.activeTrips}      icon={MapPin}    color="brand"   />
            <KpiCard label="Pending Trips"     value={kpis.pendingTrips}     icon={Clock}     color="blue"    />
            <KpiCard label="Drivers On Duty"   value={kpis.driversOnDuty}    icon={Users}     color="emerald" />
            <KpiCard
              label="Fleet Utilization"
              value={kpis.fleetUtilization != null ? `${kpis.fleetUtilization.toFixed(1)}%` : '—'}
              icon={TrendingUp}
              color="brand"
              sub="active / non-retired"
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trips donut */}
        <SectionCard title="Trips by Status">
          {cLoading ? <Skeleton h="h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={tripsByStatus} dataKey="count" nameKey="status"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={3}
                >
                  {tripsByStatus.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP} />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Fleet by type bar */}
        <SectionCard title="Fleet by Vehicle Type">
          {cLoading ? <Skeleton h="h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vehiclesByType} barSize={32}>
                <XAxis
                  dataKey="type" tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip {...TOOLTIP} cursor={{ fill: '#F4F6FA' }} />
                <Bar dataKey="count" fill="#7C2D84" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Alerts + Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts panel */}
        <div className="bg-white rounded-xl shadow-card border border-surface-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              Alerts
              {totalAlerts > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold ring-1 ring-red-200">
                  {totalAlerts}
                </span>
              )}
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {aLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} />)
            ) : totalAlerts === 0 ? (
              <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                <CheckCircle size={16} className="text-emerald-500" />
                All clear — no active alerts
              </div>
            ) : (
              <>
                {expiringLicenses.map(d => (
                  <div key={d.driverId} className="flex items-center justify-between text-sm px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-100">
                    <div>
                      <span className="text-gray-800 font-medium">{d.driverName}</span>
                      <span className="text-gray-500 text-xs ml-1">— license expiring</span>
                    </div>
                    <span className="text-amber-700 text-xs font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                      {d.daysLeft}d left
                    </span>
                  </div>
                ))}
                {longMaintenance.map(v => (
                  <div key={v.vehicleId} className="flex items-center justify-between text-sm px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
                    <div>
                      <span className="text-gray-800 font-medium font-mono text-xs">{v.registrationNumber}</span>
                      <span className="text-gray-500 text-xs ml-1">— in maintenance</span>
                    </div>
                    <span className="text-red-700 text-xs font-semibold bg-red-100 px-2 py-0.5 rounded-full">
                      {v.daysInShop}d in shop
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Recent trips */}
        <div className="bg-white rounded-xl shadow-card border border-surface-border overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border">
            <h3 className="text-sm font-semibold text-gray-900">Recent Trips</h3>
          </div>
          <div className="divide-y divide-surface-border">
            {cLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : recentTrips.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No trips recorded yet</p>
            ) : (
              recentTrips.slice(0, 5).map((trip, i) => (
                <div key={trip.id || i} className="flex items-center justify-between px-5 py-3 hover:bg-surface-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {trip.source} <span className="text-gray-400 mx-1">→</span> {trip.destination}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(trip.createdAt)}</p>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}