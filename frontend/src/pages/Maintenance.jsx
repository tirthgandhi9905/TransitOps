import React, { useState } from 'react'
import { Plus, CheckCircle2, Wrench } from 'lucide-react'
import Table         from '../components/ui/Table'
import StatusBadge   from '../components/ui/StatusBadge'
import Button        from '../components/ui/Button'
import SearchFilter  from '../components/ui/SearchFilter'
import Modal         from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField, { Input, Select, Textarea } from '../components/ui/FormField'
import useApi        from '../hooks/useApi'
import useAuth       from '../hooks/useAuth'
import {
  listMaintenance, createMaintenance,
  closeMaintenance, deleteMaintenance
} from '../api/maintenance'
import { listVehicles } from '../api/vehicles'
import { MAINTENANCE_TYPES, VEHICLE_STATUS } from '../utils/constants'
import { formatDate, formatCurrency, humanize } from '../utils/helpers'

const EMPTY = {
  vehicleId: '', maintenanceType: 'OIL_CHANGE',
  description: '', cost: '', vendor: '', startDate: ''
}

function MaintenanceForm({ form, onChange, errors, vehicles }) {
  return (
    <div className="space-y-4">
      <FormField label="Vehicle" required error={errors.vehicleId}>
        <Select value={form.vehicleId} onChange={e => onChange('vehicleId', e.target.value)}>
          <option value="">Select a vehicle…</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>
              {v.registrationNumber} — {v.vehicleName} ({v.status.replace('_', ' ')})
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Maintenance Type" required>
          <Select value={form.maintenanceType} onChange={e => onChange('maintenanceType', e.target.value)}>
            {MAINTENANCE_TYPES.map(t => (
              <option key={t} value={t}>{humanize(t)}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Cost (₹)" error={errors.cost}>
          <Input
            type="number" value={form.cost}
            onChange={e => onChange('cost', e.target.value)}
            placeholder="1200"
          />
        </FormField>
      </div>

      <FormField label="Vendor / Garage">
        <Input
          value={form.vendor}
          onChange={e => onChange('vendor', e.target.value)}
          placeholder="QuickFix Garage"
        />
      </FormField>

      <FormField label="Start Date" required error={errors.startDate}>
        <Input
          type="date" value={form.startDate}
          onChange={e => onChange('startDate', e.target.value)}
        />
      </FormField>

      <FormField label="Description">
        <Textarea
          rows={3} value={form.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="Full synthetic oil change + filter…"
        />
      </FormField>
    </div>
  )
}

export default function Maintenance() {
  const { canEdit } = useAuth()
  const editable    = canEdit('Maintenance')

  const [statusF,  setStatusF]  = useState('')
  const [page,     setPage]     = useState(1)
  const [showAdd,  setShowAdd]  = useState(false)
  const [closing,  setClosing]  = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [errors,   setErrors]   = useState({})
  const [saving,   setSaving]   = useState(false)
  const [closeLoad,setCloseLoad]= useState(false)
  const [delLoad,  setDelLoad]  = useState(false)
  const [apiErr,   setApiErr]   = useState('')

  // fetch maintenance records
  const { data: maintRes, loading, refetch } = useApi(
    () => listMaintenance({ status: statusF, page, limit: 15 }),
    [statusF, page]
  )

  // vehicles eligible for maintenance: AVAILABLE or ON_TRIP (not RETIRED/IN_SHOP)
  const { data: vehiclesRes } = useApi(
    () => listVehicles({ limit: 100 })
  )

  const records  = maintRes?.data    || []
  const meta     = maintRes?.meta    || {}
  const allVehicles = (vehiclesRes?.data || []).filter(
    v => v.status === VEHICLE_STATUS.AVAILABLE || v.status === VEHICLE_STATUS.ON_TRIP
  )

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.vehicleId)        e.vehicleId  = 'Required'
    if (!form.startDate)        e.startDate  = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const openAdd = () => {
    setForm({ ...EMPTY, startDate: new Date().toISOString().slice(0, 10) })
    setErrors({}); setApiErr(''); setShowAdd(true)
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true); setApiErr('')
    try {
      await createMaintenance({
        ...form,
        cost: form.cost ? parseFloat(form.cost) : undefined,
      })
      setShowAdd(false); refetch()
    } catch (err) {
      setApiErr(err.response?.data?.error?.message || 'Failed to create record')
    } finally { setSaving(false) }
  }

  const handleClose = async () => {
    setCloseLoad(true)
    try { await closeMaintenance(closing.id); setClosing(null); refetch() }
    catch { setClosing(null) }
    finally { setCloseLoad(false) }
  }

  const handleDelete = async () => {
    setDelLoad(true)
    try { await deleteMaintenance(deleting.id); setDeleting(null); refetch() }
    catch { setDeleting(null) }
    finally { setDelLoad(false) }
  }

  const columns = [
    {
      key: 'vehicle', label: 'Vehicle',
      render: (_, r) => (
        <div>
          <p className="text-slate-200 font-medium text-sm">
            {r.vehicle?.registrationNumber || '—'}
          </p>
          <p className="text-xs text-slate-500">{r.vehicle?.vehicleName}</p>
        </div>
      )
    },
    {
      key: 'maintenanceType', label: 'Type',
      render: v => (
        <span className="flex items-center gap-1.5 text-sm text-slate-300">
          <Wrench size={12} className="text-slate-500" />
          {humanize(v)}
        </span>
      )
    },
    { key: 'vendor',    label: 'Vendor',    render: v => v || '—' },
    { key: 'cost',      label: 'Cost',      render: v => v ? formatCurrency(v) : '—' },
    { key: 'startDate', label: 'Start',     render: v => formatDate(v) },
    { key: 'endDate',   label: 'Closed',    render: v => formatDate(v) },
    { key: 'status',    label: 'Status',    render: v => <StatusBadge status={v} /> },
    ...(editable ? [{
      key: '_actions', label: '',
      render: (_, row) => (
        <div className="flex gap-1.5 justify-end">
          {row.status === 'ACTIVE' && (
            <Button size="sm" variant="success" onClick={() => setClosing(row)}>
              <CheckCircle2 size={12} /> Close
            </Button>
          )}
          {row.status === 'COMPLETED' && (
            <Button
              size="icon" variant="ghost"
              onClick={() => setDeleting(row)}
              className="hover:text-red-400"
            >
              ✕
            </Button>
          )}
        </div>
      )
    }] : [])
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {[{ label: 'All', value: '' }, { label: 'Active', value: 'ACTIVE' }, { label: 'Completed', value: 'COMPLETED' }].map(t => (
            <button
              key={t.value}
              onClick={() => { setStatusF(t.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${statusF === t.value
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {editable && (
          <Button onClick={openAdd}><Plus size={15} /> Add Record</Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <Table
          columns={columns} data={records} loading={loading}
          emptyMessage="No maintenance records found."
          currentPage={page} totalPages={meta.pages || 1} onPageChange={setPage}
        />
      </div>

      {/* Create Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Maintenance Record" size="lg">
        {apiErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {apiErr}
          </div>
        )}
        <MaintenanceForm form={form} onChange={setField} errors={errors} vehicles={allVehicles} />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>Create Record</Button>
        </div>
      </Modal>

      {/* Close confirm */}
      <ConfirmDialog
        isOpen={!!closing} onClose={() => setClosing(null)}
        onConfirm={handleClose} loading={closeLoad}
        title="Close Maintenance"
        message={`Mark maintenance on "${closing?.vehicle?.registrationNumber}" as completed? Vehicle status will return to Available.`}
        confirmLabel="Close Record"
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={handleDelete} loading={delLoad} danger
        title="Delete Record"
        message="Delete this completed maintenance record? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}