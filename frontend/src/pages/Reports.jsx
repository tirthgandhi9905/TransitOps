import React, { useState, useRef } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { Download, FileText, TrendingUp, Fuel, DollarSign, BarChart3 } from 'lucide-react'
import Button from '../components/ui/Button'
import useApi from '../hooks/useApi'
import {
  getFuelEfficiency, getOperationalCost,
  getVehicleROI, getFleetUtilization, exportReportCsv
} from '../api/reports'
import { formatCurrency, formatNumber } from '../utils/helpers'
import Papa from 'papaparse'

// Light-mode chart tooltip
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

// Section card with icon header
function Section({ title, icon: Icon, color = 'brand', children, id }) {
  const colorMap = {
    brand:   'text-brand-600   bg-brand-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber:   'text-amber-600   bg-amber-50',
    blue:    'text-blue-600    bg-blue-50',
  }
  const c = colorMap[color] || colorMap.brand
  return (
    <div id={id} className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-surface-border">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c}`}>
          <Icon size={14} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ChartSkeleton({ height = 220 }) {
  return <div className="bg-gray-100 animate-pulse rounded-lg" style={{ height }} />
}

function EmptyChart({ message = 'No data recorded yet.' }) {
  return <p className="text-gray-400 text-sm py-10 text-center">{message}</p>
}

function RoiBadge({ roi }) {
  if (roi == null) return <span className="text-gray-300">—</span>
  const color = roi >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
  return (
    <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${color}`}>
      {roi.toFixed(1)}%
    </span>
  )
}

// Axis text color for light theme
const AXIS_TICK = { fill: '#9CA3AF', fontSize: 11 }

export default function Reports() {
  const reportRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  const { data: fuelEffRes, loading: fuelLoad } = useApi(getFuelEfficiency)
  const { data: opCostRes,  loading: costLoad } = useApi(getOperationalCost)
  const { data: roiRes,     loading: roiLoad  } = useApi(getVehicleROI)
  const { data: utilRes,    loading: utilLoad  } = useApi(getFleetUtilization)

  const fuelData  = fuelEffRes?.data      || []
  const costData  = opCostRes?.data       || []
  const roiData   = roiRes?.data          || []
  const utilTrend = utilRes?.data?.trend  || []

  const handleCsvExport = () => {
    const rows = roiData.map(r => ({
      'Vehicle':            r.registrationNumber,
      'Revenue (₹)':        r.revenue         ?? 0,
      'Fuel Cost (₹)':      r.fuelCost        ?? 0,
      'Maintenance (₹)':    r.maintenanceCost ?? 0,
      'Other Expenses (₹)': r.otherExpenses   ?? 0,
      'Total Cost (₹)':     r.totalCost       ?? 0,
      'Acquisition (₹)':    r.acquisitionCost ?? 0,
      'ROI (%)':            r.roi?.toFixed(2) ?? '—',
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

  const handlePdfExport = async () => {
    setExporting(true)
    try {
      const { default: jsPDF }       = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 1.5,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
      const pdfW    = pdf.internal.pageSize.getWidth()
      const pdfH    = (canvas.height * pdfW) / canvas.width
      const pageH   = pdf.internal.pageSize.getHeight()

      let yPos = 0
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
      <div className="flex items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">Based on all recorded trips, fuel logs, and expenses.</p>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={handleCsvExport}>
            <Download size={13} /> Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePdfExport} loading={exporting}>
            <FileText size={13} /> Export PDF
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-5">

        {/* 1. Fleet Utilization */}
        <Section title="Fleet Utilization — Last 30 Days" icon={TrendingUp} color="brand" id="util-chart">
          {utilLoad ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={utilTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F8" />
                <XAxis
                  dataKey="date" tick={AXIS_TICK}
                  axisLine={false} tickLine={false}
                  tickFormatter={d => d?.slice(5)}
                />
                <YAxis
                  tick={AXIS_TICK} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} domain={[0, 100]}
                />
                <Tooltip
                  {...TOOLTIP}
                  formatter={v => [`${v.toFixed(1)}%`, 'Utilization']}
                />
                <Line
                  type="monotone" dataKey="utilization"
                  stroke="#7C2D84" strokeWidth={2.5}
                  dot={{ fill: '#7C2D84', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#7C2D84' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* 2. Fuel Efficiency */}
        <Section title="Fuel Efficiency (km / L)" icon={Fuel} color="emerald" id="fuel-chart">
          {fuelLoad ? <ChartSkeleton /> : fuelData.length === 0 ? (
            <EmptyChart message="No fuel data recorded yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fuelData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F8" />
                <XAxis dataKey="registrationNumber" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip {...TOOLTIP} formatter={v => [`${v.toFixed(2)} km/L`, 'Efficiency']} />
                <Bar dataKey="efficiency" fill="#10B981" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* 3. Operational Cost */}
        <Section title="Operational Cost Breakdown (₹)" icon={BarChart3} color="amber" id="cost-chart">
          {costLoad ? <ChartSkeleton height={240} /> : costData.length === 0 ? (
            <EmptyChart message="No cost data recorded yet." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={costData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F8" />
                <XAxis dataKey="registrationNumber" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  tick={AXIS_TICK} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                />
                <Tooltip
                  {...TOOLTIP}
                  formatter={(v, name) => [formatCurrency(v), name]}
                  cursor={{ fill: '#F4F6FA' }}
                />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>}
                />
                <Bar dataKey="fuelCost"        name="Fuel"        fill="#F59E0B" stackId="a" />
                <Bar dataKey="maintenanceCost" name="Maintenance" fill="#EF4444" stackId="a" />
                <Bar dataKey="otherExpenses"   name="Other"       fill="#7C2D84" radius={[4,4,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* 4. Vehicle ROI */}
        <Section title="Vehicle ROI Analysis" icon={DollarSign} color="blue" id="roi-table">
          {roiLoad ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : roiData.length === 0 ? (
            <EmptyChart message="No ROI data available yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-muted border-b border-surface-border">
                    {['Vehicle','Revenue','Fuel','Maintenance','Other','Total Cost','Acquisition','ROI'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {roiData.map((r, i) => (
                    <tr key={r.vehicleId || i} className="hover:bg-surface-muted/60 transition-colors">
                      <td className="px-3 py-3 text-gray-900 font-semibold font-mono text-xs">{r.registrationNumber}</td>
                      <td className="px-3 py-3 text-emerald-600 font-medium tabular-nums">{formatCurrency(r.revenue)}</td>
                      <td className="px-3 py-3 text-gray-600 tabular-nums">{formatCurrency(r.fuelCost)}</td>
                      <td className="px-3 py-3 text-gray-600 tabular-nums">{formatCurrency(r.maintenanceCost)}</td>
                      <td className="px-3 py-3 text-gray-600 tabular-nums">{formatCurrency(r.otherExpenses)}</td>
                      <td className="px-3 py-3 text-red-600 font-medium tabular-nums">{formatCurrency(r.totalCost)}</td>
                      <td className="px-3 py-3 text-gray-600 tabular-nums">{formatCurrency(r.acquisitionCost)}</td>
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