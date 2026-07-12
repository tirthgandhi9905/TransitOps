import React, { useState, useEffect } from 'react'
import {
  Plus, Send, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, Truck, User, Scale
} from 'lucide-react'
import Table         from '../components/ui/Table'
import StatusBadge   from '../components/ui/StatusBadge'
import Button        from '../components/ui/Button'
import Modal         from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField, { Input, Select, Textarea } from '../components/ui/FormField'
import useApi        from '../hooks/useApi'
import useAuth       from '../hooks/useAuth'
import {
  listTrips, createTrip, dispatchTrip,
  completeTrip, cancelTrip, deleteTrip
} from '../api/trips'
import { getAvailableVehicles } from '../api/vehicles'
import { getAvailableDrivers  } from '../api/drivers'
import { TRIP_STATUS } from '../utils/constants'
import { formatDate, formatCurrency, formatNumber } from '../utils/helpers'

// ─── Status tab config ────────────────────────────────────────────────────────
const TABS = [
  { label: 'All',        value: ''            },
  { label: 'Draft',      value: 'DRAFT'       },
  { label: 'Dispatched', value: 'DISPATCHED'  },
  { label: 'Completed',  value: 'COMPLETED'   },
  { label: 'Cancelled',  value: 'CANCELLED'   },
]

// ─── Create Trip — 3-step wizard ─────────────────────────────────────────────
const STEP_LABELS = ['Route & Cargo', 'Select Vehicle', 'Select Driver']

const TRIP_EMPTY = {
  source: '', destination: '', plannedDistance: '', cargoWeight: '',
  revenue: '', notes: '', vehicleId: '', driverId: ''
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {STEP_LABELS.map((label, i) => {
        const step    = i + 1
        const active  = step === current
        const done    = step < current
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${done   ? 'bg-emerald-600 text-white'
                : active ? 'bg-indigo-600 text-white'
                :          'bg-slate-700 text-slate-400'}`}
              >
                {done ? <CheckCircle2 size={14}/> : step}
              </div>
              <span className={`text-xs ${active ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 ${current > step ? 'bg-emerald-600' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function Step1({ form, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Source" required error={errors.source}>
          <Input value={form.source} onChange={e=>onChange('source',e.target.value)} placeholder="Hyderabad" />
        </FormField>
        <FormField label="Destination" required error={errors.destination}>
          <Input value={form.destination} onChange={e=>onChange('destination',e.target.value)} placeholder="Mumbai" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Planned Distance (km)" required error={errors.plannedDistance}>
          <Input type="number" value={form.plannedDistance} onChange={e=>onChange('plannedDistance',e.target.value)} placeholder="710" />
        </FormField>
        <FormField label="Cargo Weight (kg)" required error={errors.cargoWeight}>
          <Input type="number" value={form.cargoWeight} onChange={e=>onChange('cargoWeight',e.target.value)} placeholder="450" />
        </FormField>
      </div>
      <FormField label="Revenue (₹)">
        <Input type="number" value={form.revenue} onChange={e=>onChange('revenue',e.target.value)} placeholder="15000" />
      </FormField>
      <FormField label="Notes">
        <Textarea rows={2} value={form.notes} onChange={e=>onChange('notes',e.target.value)} placeholder="Handle with care…" />
      </FormField>
    </div>
  )
}

function Step2({ form, onChange, errors, vehicles }) {
  const cargo    = parseFloat(form.cargoWeight) || 0
  const selected = vehicles.find(v => v.id === form.vehicleId)

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Cargo weight: <span className="text-slate-200 font-medium">{cargo} kg</span>.
        Only AVAILABLE vehicles are shown.
      </p>

      {errors.vehicleId && (
        <p className="text-xs text-red-400">{errors.vehicleId}</p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {vehicles.length === 0 && (
          <p className="text-slate-500 text-sm py-4 text-center">No available vehicles.</p>
        )}
        {vehicles.map(v => {
          const overload = cargo > v.maxLoadCapacity
          const chosen   = form.vehicleId === v.id
          return (
            <button
              key={v.id}
              onClick={() => !overload && onChange('vehicleId', v.id)}
              disabled={overload}
              className={`w-full text-left p-3 rounded-lg border transition-all
                ${chosen
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : overload
                    ? 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-slate-400" />
                  <span className="text-slate-200 text-sm font-medium">{v.registrationNumber}</span>
                  <span className="text-slate-400 text-xs">{v.vehicleName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={overload ? 'text-red-400' : 'text-slate-400'}>
                    <Scale size={11} className="inline mr-1"/>
                    {cargo}/{v.maxLoadCapacity} kg
                    {overload && ' ⚠ Overload'}
                  </span>
                  {chosen && <CheckCircle2 size={14} className="text-indigo-400"/>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Step3({ form, onChange, errors, drivers }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Only AVAILABLE drivers with valid licenses are shown.
      </p>

      {errors.driverId && (
        <p className="text-xs text-red-400">{errors.driverId}</p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {drivers.length === 0 && (
          <p className="text-slate-500 text-sm py-4 text-center">No available drivers.</p>
        )}
        {drivers.map(d => {
          const chosen = form.driverId === d.id
          return (
            <button
              key={d.id}
              onClick={() => onChange('driverId', d.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all
                ${chosen
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400"/>
                  <span className="text-slate-200 text-sm font-medium">{d.name}</span>
                  <span className="text-slate-400 text-xs">{d.licenseNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Cat. {d.licenseCategory}</span>
                  <span className="text-slate-400">Exp: {formatDate(d.licenseExpiry)}</span>
                  {chosen && <CheckCircle2 size={14} className="text-indigo-400"/>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Complete Trip modal ──────────────────────────────────────────────────────
function CompleteModal({ isOpen, onClose, onConfirm, loading }) {
  const [data, setData] = useState({ endOdometer:'', fuelConsumed:'', actualDistance:'', notes:'' })
  const set = (k,v) => setData(d=>({...d,[k]:v}))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Trip" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="End Odometer (km)" required>
            <Input type="number" value={data.endOdometer} onChange={e=>set('endOdometer',e.target.value)} placeholder="13160"/>
          </FormField>
          <FormField label="Actual Distance (km)">
            <Input type="number" value={data.actualDistance} onChange={e=>set('actualDistance',e.target.value)} placeholder="710"/>
          </FormField>
        </div>
        <FormField label="Fuel Consumed (L)" required>
          <Input type="number" value={data.fuelConsumed} onChange={e=>set('fuelConsumed',e.target.value)} placeholder="65.5"/>
        </FormField>
        <FormField label="Notes">
          <Textarea rows={2} value={data.notes} onChange={e=>set('notes',e.target.value)} placeholder="Delivered on time…"/>
        </FormField>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="success"
          loading={loading}
          onClick={() => onConfirm({
            endOdometer:    parseFloat(data.endOdometer)    || undefined,
            fuelConsumed:   parseFloat(data.fuelConsumed)   || undefined,
            actualDistance: parseFloat(data.actualDistance) || undefined,
            notes:          data.notes
          })}
        >
          Mark Completed
        </Button>
      </div>
    </Modal>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TripManagement() {
  const { canEdit } = useAuth()
  const editable    = canEdit('Trips')

  const [tab,          setTab]          = useState('')
  const [page,         setPage]         = useState(1)
  const [showCreate,   setShowCreate]   = useState(false)
  const [step,         setStep]         = useState(1)
  const [form,         setForm]         = useState(TRIP_EMPTY)
  const [formErrors,   setFormErrors]   = useState({})
  const [saving,       setSaving]       = useState(false)
  const [apiErr,       setApiErr]       = useState('')

  const [completing,   setCompleting]   = useState(null)   // trip obj
  const [compLoading,  setCompLoading]  = useState(false)
  const [cancelling,   setCancelling]   = useState(null)
  const [cancelLoad,   setCancelLoad]   = useState(false)
  const [dispatching,  setDispatching]  = useState(null)
  const [dispatchLoad, setDispatchLoad] = useState(false)
  const [deleting,     setDeleting]     = useState(null)
  const [delLoad,      setDelLoad]      = useState(false)

  const params = { status: tab, page, limit: 15 }
  const { data: tripsRes, loading: tripsLoading, refetch } = useApi(
    () => listTrips(params), [tab, page]
  )
  const { data: vehiclesRes } = useApi(getAvailableVehicles)
  const { data: driversRes  } = useApi(getAvailableDrivers)

  const trips    = tripsRes?.data    || []
  const meta     = tripsRes?.meta    || {}
  const vehicles = vehiclesRes?.data || []
  const drivers  = driversRes?.data  || []

  const setField = (k,v) => setForm(f=>({...f,[k]:v}))

  // Validation per step
  const validateStep = () => {
    const e = {}
    if (step === 1) {
      if (!form.source.trim())        e.source        = 'Required'
      if (!form.destination.trim())   e.destination   = 'Required'
      if (!form.plannedDistance)      e.plannedDistance = 'Required'
      if (!form.cargoWeight)          e.cargoWeight   = 'Required'
    }
    if (step === 2 && !form.vehicleId) e.vehicleId = 'Select a vehicle'
    if (step === 3 && !form.driverId)  e.driverId  = 'Select a driver'
    setFormErrors(e)
    return !Object.keys(e).length
  }

  const nextStep = () => { if (validateStep()) setStep(s => s + 1) }
  const prevStep = () => { setFormErrors({}); setStep(s => s - 1) }

  const openCreate = () => {
    setForm(TRIP_EMPTY); setFormErrors({})
    setApiErr(''); setStep(1); setShowCreate(true)
  }

  const handleCreate = async () => {
    if (!validateStep()) return
    setSaving(true); setApiErr('')
    try {
      await createTrip({
        vehicleId:       form.vehicleId,
        driverId:        form.driverId,
        source:          form.source,
        destination:     form.destination,
        cargoWeight:     parseFloat(form.cargoWeight),
        plannedDistance: parseFloat(form.plannedDistance),
        revenue:         form.revenue ? parseFloat(form.revenue) : undefined,
        notes:           form.notes || undefined,
      })
      setShowCreate(false); refetch()
    } catch(err) {
      setApiErr(err.response?.data?.error?.message || 'Failed to create trip')
    } finally { setSaving(false) }
  }

  const handleDispatch = async () => {
    setDispatchLoad(true)
    try { await dispatchTrip(dispatching.id); setDispatching(null); refetch() }
    catch { setDispatching(null) }
    finally { setDispatchLoad(false) }
  }

  const handleComplete = async (data) => {
    setCompLoading(true)
    try { await completeTrip(completing.id, data); setCompleting(null); refetch() }
    catch { }
    finally { setCompLoading(false) }
  }

  const handleCancel = async () => {
    setCancelLoad(true)
    try { await cancelTrip(cancelling.id); setCancelling(null); refetch() }
    catch { setCancelling(null) }
    finally { setCancelLoad(false) }
  }

  const handleDelete = async () => {
    setDelLoad(true)
    try { await deleteTrip(deleting.id); setDeleting(null); refetch() }
    catch { setDeleting(null) }
    finally { setDelLoad(false) }
  }

  const columns = [
    { key:'source', label:'Route', render:(_,r)=>(
      <div>
        <p className="text-slate-200 font-medium text-sm">{r.source} → {r.destination}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {r.vehicle?.registrationNumber} · {r.driver?.name}
        </p>
      </div>
    )},
    { key:'cargoWeight', label:'Cargo', render:v=>`${formatNumber(v)} kg`},
    { key:'plannedDistance', label:'Distance', render:v=>v ? `${formatNumber(v)} km` : '—'},
    { key:'revenue', label:'Revenue', render:v=>v ? formatCurrency(v) : '—'},
    { key:'createdAt', label:'Created', render:v=>formatDate(v)},
    { key:'status', label:'Status', render:v=><StatusBadge status={v}/>},
    ...(editable ? [{
      key:'_actions', label:'Actions',
      render:(_,row)=>(
        <div className="flex gap-1.5 justify-end flex-wrap">
          {row.status === TRIP_STATUS.DRAFT && (<>
            <Button size="sm" variant="primary" onClick={()=>setDispatching(row)}>
              <Send size={12}/> Dispatch
            </Button>
            <Button size="sm" variant="ghost" onClick={()=>setDeleting(row)} className="hover:text-red-400">
              <XCircle size={12}/>
            </Button>
          </>)}
          {row.status === TRIP_STATUS.DISPATCHED && (<>
            <Button size="sm" variant="success" onClick={()=>setCompleting(row)}>
              <CheckCircle2 size={12}/> Complete
            </Button>
            <Button size="sm" variant="ghost" onClick={()=>setCancelling(row)} className="hover:text-red-400">
              <XCircle size={12}/> Cancel
            </Button>
          </>)}
        </div>
      )
    }] : [])
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        {/* Status tabs */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={()=>{ setTab(t.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${tab===t.value
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {editable && (
          <Button onClick={openCreate}><Plus size={15}/> New Trip</Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <Table
          columns={columns} data={trips} loading={tripsLoading}
          emptyMessage="No trips found."
          currentPage={page} totalPages={meta.pages||1} onPageChange={setPage}
        />
      </div>

      {/* ── Create Trip Wizard Modal ── */}
      <Modal
        isOpen={showCreate}
        onClose={()=>setShowCreate(false)}
        title="New Trip"
        size="lg"
      >
        <StepIndicator current={step}/>

        {apiErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {apiErr}
          </div>
        )}

        {step === 1 && <Step1 form={form} onChange={setField} errors={formErrors}/>}
        {step === 2 && <Step2 form={form} onChange={setField} errors={formErrors} vehicles={vehicles}/>}
        {step === 3 && <Step3 form={form} onChange={setField} errors={formErrors} drivers={drivers}/>}

        <div className="flex justify-between mt-6">
          <div>
            {step > 1 && (
              <Button variant="secondary" onClick={prevStep}>
                <ChevronLeft size={14}/> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={()=>setShowCreate(false)}>Cancel</Button>
            {step < 3
              ? <Button onClick={nextStep}>Next <ChevronRight size={14}/></Button>
              : <Button onClick={handleCreate} loading={saving}>Create Trip</Button>
            }
          </div>
        </div>
      </Modal>

      {/* ── Complete Trip Modal ── */}
      <CompleteModal
        isOpen={!!completing}
        onClose={()=>setCompleting(null)}
        onConfirm={handleComplete}
        loading={compLoading}
      />

      {/* ── Dispatch confirm ── */}
      <ConfirmDialog
        isOpen={!!dispatching} onClose={()=>setDispatching(null)}
        onConfirm={handleDispatch} loading={dispatchLoad}
        title="Dispatch Trip"
        message={`Dispatch trip from ${dispatching?.source} to ${dispatching?.destination}? Vehicle and driver will be marked On Trip.`}
        confirmLabel="Dispatch"
      />

      {/* ── Cancel confirm ── */}
      <ConfirmDialog
        isOpen={!!cancelling} onClose={()=>setCancelling(null)}
        onConfirm={handleCancel} loading={cancelLoad}
        title="Cancel Trip" danger
        message="Cancel this trip? The vehicle and driver will be restored to Available."
        confirmLabel="Cancel Trip"
      />

      {/* ── Delete (draft only) ── */}
      <ConfirmDialog
        isOpen={!!deleting} onClose={()=>setDeleting(null)}
        onConfirm={handleDelete} loading={delLoad}
        title="Delete Trip" danger
        message="Delete this draft trip? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}