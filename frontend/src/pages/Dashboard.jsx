import React, { useState } from 'react'
import {
  Truck, Users, MapPin, Wrench, Activity,
  Clock, AlertTriangle, TrendingUp
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import KpiCard   from '../components/ui/KpiCard'
import StatusBadge from '../components/ui/StatusBadge'
import useApi    from '../hooks/useApi'
import { getDashboardKpis, getDashboardAlerts, getDashboardCharts } from '../api/dashboard'
import { formatDate } from '../utils/helpers'

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6']

export default function Dashboard() {
  const { data: kpisRes,   loading: kLoading }  = useApi(getDashboardKpis)
  const { data: alertsRes, loading: aLoading }  = useApi(getDashboardAlerts)
  const { data: chartsRes, loading: cLoading }  = useApi(getDashboardCharts)

  const kpis   = kpisRes?.data   || {}
  const alerts = alertsRes?.data || {}
  const charts = chartsRes?.data || {}

  const tripsByStatus  = charts.tripsByStatus  || []
  const vehiclesByType = charts.vehiclesByType || []
  const recentTrips    = charts.recentTrips    || []

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Vehicles"    value={kpis.totalVehicles}    icon={Truck}     color="indigo" />
        <KpiCard label="Available"         value={kpis.availableVehicles} icon={Truck}    color="emerald" />
        <KpiCard label="On Trip"           value={kpis.onTripVehicles}   icon={Activity}  color="blue" />
        <KpiCard label="In Maintenance"    value={kpis.inShopVehicles}   icon={Wrench}    color="amber" />
        <KpiCard label="Active Trips"      value={kpis.activeTrips}      icon={MapPin}    color="indigo" />
        <KpiCard label="Pending Trips"     value={kpis.pendingTrips}     icon={Clock}     color="blue" />
        <KpiCard label="Drivers On Duty"   value={kpis.driversOnDuty}    icon={Users}     color="emerald" />
        <KpiCard
          label="Fleet Utilization"
          value={kpis.fleetUtilization != null ? `${kpis.fleetUtilization.toFixed(1)}%` : '—'}
          icon={TrendingUp}
          color="indigo"
          sub="active / non-retired"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trips by status donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Trips by Status</h3>
          {cLoading ? (
            <div className="h-48 bg-slate-800 animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={tripsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%"
                     innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {tripsByStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8 }}
                  labelStyle={{ color:'#94a3b8' }}
                />
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span className="text-xs text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Vehicles by type bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Fleet by Vehicle Type</h3>
          {cLoading ? (
            <div className="h-48 bg-slate-800 animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vehiclesByType} barSize={28}>
                <XAxis dataKey="type" tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8 }}
                  cursor={{ fill:'#334155' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alerts + Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400" /> Alerts
          </h3>
          {aLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-slate-800 animate-pulse rounded"/>)}</div>
          ) : (
            <div className="space-y-3">
              {(alerts.expiringLicenses || []).map(d => (
                <div key={d.driverId} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <span className="text-slate-300">{d.driverName} — license expiring</span>
                  <span className="text-amber-400 text-xs font-medium">{d.daysLeft}d left</span>
                </div>
              ))}
              {(alerts.longMaintenance || []).map(v => (
                <div key={v.vehicleId} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                  <span className="text-slate-300">{v.registrationNumber} — in shop</span>
                  <span className="text-red-400 text-xs font-medium">{v.daysInShop}d</span>
                </div>
              ))}
              {!alerts.expiringLicenses?.length && !alerts.longMaintenance?.length && (
                <p className="text-slate-500 text-sm">No active alerts</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Trips */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Recent Trips</h3>
          {cLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="h-10 bg-slate-800 animate-pulse rounded"/>)}</div>
          ) : (
            <div className="space-y-2">
              {recentTrips.length === 0 && <p className="text-slate-500 text-sm">No trips yet</p>}
              {recentTrips.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <span className="text-slate-200">{t.source} → {t.destination}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{t.driver?.name} · {formatDate(t.createdAt)}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
