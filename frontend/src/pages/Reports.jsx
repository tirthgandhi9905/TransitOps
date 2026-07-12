import React, { useState, useRef } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { Download, FileText, TrendingUp, Fuel, DollarSign, BarChart3 } from 'lucide-react'
import Button    from '../components/ui/Button'
import useApi    from '../hooks/useApi'
import {
  getFuelEfficiency, getOperationalCost,
  getVehicleROI, getFleetUtilization, exportReportCsv
} from '../api/reports'
import { formatCurrency, formatNumber } from '../utils/helpers'
import Papa from 'papaparse'

// ─── Shared chart tooltip style ───────────────────────────────────────────────
const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 },
  labelStyle:   { color: '#94a3b8' },
  cursor:       { fill: '#334155' },
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, color = 'indigo', children, id }) {
  const colorMap = {
    indigo:  'text-indigo-400 bg-indigo-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber:   'text-amber-400  bg-amber-500/10',
    blue:    'text-blue-400   bg-blue-500/10',
  }
  return (
    <div id={id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={14} className={colorMap[color].split(' ')[0]} />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ChartSkeleton({ height = 220 }) {
  return <div className={`bg-slate-800 animate-pulse rounded-lg`} style={{ height }} />
}

// ─── ROI badge ────────────────────────────────────────────────────────────────
function RoiBadge({ roi }) {
  if (roi == null) return <span className="text-slate-500">—</span>
  const color = roi >= 0 ? 'text-emerald-400' : 'text-red-400'
  return <span className={`font-semibold ${color}`}>{roi.toFixed(1)}%</span>
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Reports() {
  const reportRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  const { data: fuelEffRes,  loading: fuelLoad  } = useApi(getFuelEfficiency)
  const { data: opCostRes,   loading: costLoad  } = useApi(getOperationalCost)
  const { data: roiRes,      loading: roiLoad   } = useApi(getVehicleROI)
  const { data: utilRes,     loading: utilLoad  } = useApi(getFleetUtilization)

  const fuelData  = fuelEffRes?.data         || []
  const costData  = opCostRes?.data          || []
  const roiData   = roiRes?.data             || []
  const utilTrend = utilRes?.data?.trend     || []

  // ── CSV export ──────────────────────────────────────────────────────────────
  const handleCsvExport = () => {
    const rows = roiData.map(r => ({
      'Vehicle':          r.registrationNumber,
      'Revenue (₹)':      r.revenue         ?? 0,
      'Fuel Cost (₹)':    r.fuelCost        ?? 0,
      'Maintenance (₹)':  r.maintenanceCost ?? 0,
      'Other Expenses (₹)': r.otherExpenses ?? 0,
      'Total Cost (₹)':   r.totalCost       ?? 0,
      'Acquisition (₹)':  r.acquisitionCost ?? 0,
      'ROI (%)':          r.roi?.toFixed(2)  ?? '—',
    }))
    const csv  = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `transitops-report-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── PDF export ──────────────────────────────────────────────────────────────
  const handlePdfExport = async () => {
    setExporting(true)
    try {
      const { default: jsPDF }      = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0f172a',
        scale: 1.5,
        useCORS: true,
      })

      const imgData  = canvas.toDataURL('image/png')
      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
      const pdfW     = pdf.internal.pageSize.getWidth()
      const pdfH     = (canvas.height * pdfW) / canvas.width

      // paginate if content is taller than one page
      const pageH = pdf.internal.pageSize.getHeight()
      let yPos    = 0
      while (yPos < pdfH) {
        if (yPos > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -yPos, pdfW, pdfH)
        yPos += pageH
      }

      pdf.save(`transitops-report-${new Date().toISOString().slice(0,10)}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Analytics based on all recorded trips, fuel logs, and expenses.</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleCsvExport}>
            <Download size={13} /> Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePdfExport} loading={exporting}>
            <FileText size={13} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Capturable report area */}
      <div ref={reportRef} className="space-y-5">

        {/* 1. Fleet Utilization Trend */}
        <Section title="Fleet Utilization (Last 30 Days)" icon={TrendingUp} color="indigo" id="util-chart">
          {utilLoad ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={utilTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={d => d?.slice(5)}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={v => [`${v.toFixed(1)}%`, 'Utilization']}
                />
                <Line
                  type="monotone" dataKey="utilization"
                  stroke="#6366f1" strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* 2. Fuel Efficiency */}
        <Section title="Fuel Efficiency (km / L)" icon={Fuel} color="emerald" id="fuel-chart">
          {fuelLoad ? <ChartSkeleton /> : fuelData.length === 0 ? (
            <p className="text-slate-500 text-sm py-10 text-center">No fuel data recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fuelData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="registrationNumber"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={v => [`${v.toFixed(2)} km/L`, 'Efficiency']}
                />
                <Bar dataKey="efficiency" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* 3. Operational Cost Breakdown */}
        <Section title="Operational Cost Breakdown (₹)" icon={BarChart3} color="amber" id="cost-chart">
          {costLoad ? <ChartSkeleton /> : costData.length === 0 ? (
            <p className="text-slate-500 text-sm py-10 text-center">No cost data recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={costData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="registrationNumber"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  formatter={(v, name) => [formatCurrency(v), name]}
                />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={v => <span className="text-xs text-slate-400">{v}</span>}
                />
                <Bar dataKey="fuelCost"        name="Fuel"        fill="#f59e0b" radius={[0,0,0,0]} stackId="a" />
                <Bar dataKey="maintenanceCost" name="Maintenance" fill="#ef4444" radius={[0,0,0,0]} stackId="a" />
                <Bar dataKey="otherExpenses"   name="Other"       fill="#6366f1" radius={[4,4,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* 4. Vehicle ROI Table */}
        <Section title="Vehicle ROI" icon={DollarSign} color="blue" id="roi-table">
          {roiLoad ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 animate-pulse rounded" />
              ))}
            </div>
          ) : roiData.length === 0 ? (
            <p className="text-slate-500 text-sm py-10 text-center">No data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['Vehicle','Revenue','Fuel','Maintenance','Other','Total Cost','Acquisition','ROI'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roiData.map((r, i) => (
                    <tr key={r.vehicleId || i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-3 py-3 text-slate-200 font-medium">{r.registrationNumber}</td>
                      <td className="px-3 py-3 text-emerald-400">{formatCurrency(r.revenue)}</td>
                      <td className="px-3 py-3 text-slate-300">{formatCurrency(r.fuelCost)}</td>
                      <td className="px-3 py-3 text-slate-300">{formatCurrency(r.maintenanceCost)}</td>
                      <td className="px-3 py-3 text-slate-300">{formatCurrency(r.otherExpenses)}</td>
                      <td className="px-3 py-3 text-red-400">{formatCurrency(r.totalCost)}</td>
                      <td className="px-3 py-3 text-slate-300">{formatCurrency(r.acquisitionCost)}</td>
                      <td className="px-3 py-3"><RoiBadge roi={r.roi} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}
