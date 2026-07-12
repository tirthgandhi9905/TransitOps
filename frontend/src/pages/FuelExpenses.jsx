import React, { useState } from 'react'
import { Plus, Fuel, Receipt, Trash2 } from 'lucide-react'
import Table         from '../components/ui/Table'
import Button        from '../components/ui/Button'
import Modal         from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField, { Input, Select, Textarea } from '../components/ui/FormField'
import useApi        from '../hooks/useApi'
import useAuth       from '../hooks/useAuth'
import { listFuel, createFuel, deleteFuel, listExpenses, createExpense, deleteExpense } from '../api/fuel_expenses'
import { listVehicles } from '../api/vehicles'
import { listTrips }    from '../api/trips'
import { EXPENSE_TYPES } from '../utils/constants'
import { formatDate, formatCurrency, humanize } from '../utils/helpers'

// ─── Fuel Log form ────────────────────────────────────────────────────────────
const FUEL_EMPTY = { vehicleId:'', tripId:'', fuelLiters:'', fuelCost:'', fuelStation:'', date:'' }

function FuelForm({ form, onChange, errors, vehicles, trips }) {
  return (
    <div className="space-y-4">
      <FormField label="Vehicle" required error={errors.vehicleId}>
        <Select value={form.vehicleId} onChange={e => onChange('vehicleId', e.target.value)}>
          <option value="">Select vehicle…</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.vehicleName}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Linked Trip (optional)">
        <Select value={form.tripId} onChange={e => onChange('tripId', e.target.value)}>
          <option value="">None</option>
          {trips.map(t => (
            <option key={t.id} value={t.id}>{t.source} → {t.destination} ({t.status})</option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Fuel (Litres)" required error={errors.fuelLiters}>
          <Input
            type="number" step="0.1"
            value={form.fuelLiters} onChange={e => onChange('fuelLiters', e.target.value)}
            placeholder="45.5"
          />
        </FormField>
        <FormField label="Total Cost (₹)" required error={errors.fuelCost}>
          <Input
            type="number"
            value={form.fuelCost} onChange={e => onChange('fuelCost', e.target.value)}
            placeholder="3800"
          />
        </FormField>
      </div>

      <FormField label="Fuel Station">
        <Input
          value={form.fuelStation} onChange={e => onChange('fuelStation', e.target.value)}
          placeholder="HP Petrol Pump, Pune"
        />
      </FormField>

      <FormField label="Date" required error={errors.date}>
        <Input type="date" value={form.date} onChange={e => onChange('date', e.target.value)} />
      </FormField>
    </div>
  )
}

// ─── Expense form ─────────────────────────────────────────────────────────────
const EXP_EMPTY = { vehicleId:'', tripId:'', expenseType:'TOLL', amount:'', description:'', expenseDate:'' }

function ExpenseForm({ form, onChange, errors, vehicles, trips }) {
  return (
    <div className="space-y-4">
      <FormField label="Vehicle" required error={errors.vehicleId}>
        <Select value={form.vehicleId} onChange={e => onChange('vehicleId', e.target.value)}>
          <option value="">Select vehicle…</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.registrationNumber} — {v.vehicleName}</option>
          ))}
        </Select>
      </FormField>

      <FormField label="Linked Trip (optional)">
        <Select value={form.tripId} onChange={e => onChange('tripId', e.target.value)}>
          <option value="">None</option>
          {trips.map(t => (
            <option key={t.id} value={t.id}>{t.source} → {t.destination}</option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Expense Type" required>
          <Select value={form.expenseType} onChange={e => onChange('expenseType', e.target.value)}>
            {EXPENSE_TYPES.map(t => <option key={t} value={t}>{humanize(t)}</option>)}
          </Select>
        </FormField>
        <FormField label="Amount (₹)" required error={errors.amount}>
          <Input
            type="number"
            value={form.amount} onChange={e => onChange('amount', e.target.value)}
            placeholder="450"
          />
        </FormField>
      </div>

      <FormField label="Description">
        <Textarea
          rows={2}
          value={form.description} onChange={e => onChange('description', e.target.value)}
          placeholder="Expressway toll — 3 booths"
        />
      </FormField>

      <FormField label="Date" required error={errors.expenseDate}>
        <Input type="date" value={form.expenseDate} onChange={e => onChange('expenseDate', e.target.value)} />
      </FormField>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FuelExpenses() {
  const { canEdit } = useAuth()
  const editable    = canEdit('Fuel')

  const [activeTab, setActiveTab] = useState('fuel')

  // Fuel state
  const [showFuel,    setShowFuel]    = useState(false)
  const [fuelForm,    setFuelForm]    = useState(FUEL_EMPTY)
  const [fuelErrors,  setFuelErrors]  = useState({})
  const [fuelSaving,  setFuelSaving]  = useState(false)
  const [fuelApiErr,  setFuelApiErr]  = useState('')
  const [delFuel,     setDelFuel]     = useState(null)
  const [delFuelLoad, setDelFuelLoad] = useState(false)
  const [fuelPage,    setFuelPage]    = useState(1)

  // Expense state
  const [showExp,     setShowExp]     = useState(false)
  const [expForm,     setExpForm]     = useState(EXP_EMPTY)
  const [expErrors,   setExpErrors]   = useState({})
  const [expSaving,   setExpSaving]   = useState(false)
  const [expApiErr,   setExpApiErr]   = useState('')
  const [delExp,      setDelExp]      = useState(null)
  const [delExpLoad,  setDelExpLoad]  = useState(false)
  const [expPage,     setExpPage]     = useState(1)

  // Data fetches
  const { data: fuelRes, loading: fuelLoading, refetch: refetchFuel } =
    useApi(() => listFuel({ page: fuelPage, limit: 15 }), [fuelPage])

  const { data: expRes, loading: expLoading, refetch: refetchExp } =
    useApi(() => listExpenses({ page: expPage, limit: 15 }), [expPage])

  const { data: vehiclesRes } = useApi(() => listVehicles({ limit: 100 }))
  const { data: tripsRes }    = useApi(() => listTrips({ limit: 100 }))

  const fuelLogs  = fuelRes?.data     || []
  const fuelMeta  = fuelRes?.meta     || {}
  const expenses  = expRes?.data      || []
  const expMeta   = expRes?.meta      || {}
  const vehicles  = vehiclesRes?.data || []
  const trips     = tripsRes?.data    || []

  const today = new Date().toISOString().slice(0, 10)

  // Fuel handlers
  const setFuelField = (k, v) => setFuelForm(f => ({ ...f, [k]: v }))
  const validateFuel = () => {
    const e = {}
    if (!fuelForm.vehicleId)  e.vehicleId  = 'Required'
    if (!fuelForm.fuelLiters) e.fuelLiters = 'Required'
    if (!fuelForm.fuelCost)   e.fuelCost   = 'Required'
    if (!fuelForm.date)       e.date       = 'Required'
    setFuelErrors(e)
    return !Object.keys(e).length
  }
  const openFuelAdd = () => {
    setFuelForm({ ...FUEL_EMPTY, date: today })
    setFuelErrors({}); setFuelApiErr(''); setShowFuel(true)
  }
  const handleFuelSave = async () => {
    if (!validateFuel()) return
    setFuelSaving(true); setFuelApiErr('')
    try {
      await createFuel({
        vehicleId:   fuelForm.vehicleId,
        tripId:      fuelForm.tripId   || undefined,
        fuelLiters:  parseFloat(fuelForm.fuelLiters),
        fuelCost:    parseFloat(fuelForm.fuelCost),
        fuelStation: fuelForm.fuelStation || undefined,
        date:        fuelForm.date,
      })
      setShowFuel(false); refetchFuel()
    } catch (err) {
      setFuelApiErr(err.response?.data?.error?.message || 'Save failed')
    } finally { setFuelSaving(false) }
  }
  const handleDelFuel = async () => {
    setDelFuelLoad(true)
    try { await deleteFuel(delFuel.id); setDelFuel(null); refetchFuel() }
    catch { setDelFuel(null) }
    finally { setDelFuelLoad(false) }
  }

  // Expense handlers
  const setExpField = (k, v) => setExpForm(f => ({ ...f, [k]: v }))
  const validateExp = () => {
    const e = {}
    if (!expForm.vehicleId)   e.vehicleId   = 'Required'
    if (!expForm.amount)      e.amount      = 'Required'
    if (!expForm.expenseDate) e.expenseDate = 'Required'
    setExpErrors(e)
    return !Object.keys(e).length
  }
  const openExpAdd = () => {
    setExpForm({ ...EXP_EMPTY, expenseDate: today })
    setExpErrors({}); setExpApiErr(''); setShowExp(true)
  }
  const handleExpSave = async () => {
    if (!validateExp()) return
    setExpSaving(true); setExpApiErr('')
    try {
      await createExpense({
        vehicleId:   expForm.vehicleId,
        tripId:      expForm.tripId || undefined,
        expenseType: expForm.expenseType,
        amount:      parseFloat(expForm.amount),
        description: expForm.description || undefined,
        expenseDate: expForm.expenseDate,
      })
      setShowExp(false); refetchExp()
    } catch (err) {
      setExpApiErr(err.response?.data?.error?.message || 'Save failed')
    } finally { setExpSaving(false) }
  }
  const handleDelExp = async () => {
    setDelExpLoad(true)
    try { await deleteExpense(delExp.id); setDelExp(null); refetchExp() }
    catch { setDelExp(null) }
    finally { setDelExpLoad(false) }
  }

  // Table columns
  const fuelColumns = [
    { key:'vehicle',     label:'Vehicle',  render:(_,r)=>(
      <div>
        <p className="text-slate-200 font-medium text-sm">{r.vehicle?.registrationNumber || '—'}</p>
        <p className="text-xs text-slate-500">{r.vehicle?.vehicleName}</p>
      </div>
    )},
    { key:'date',        label:'Date',     render:v=>formatDate(v) },
    { key:'fuelLiters',  label:'Litres',   render:v=>`${v} L` },
    { key:'fuelCost',    label:'Cost',     render:v=>formatCurrency(v) },
    { key:'fuelStation', label:'Station',  render:v=>v||'—' },
    { key:'trip',        label:'Trip',     render:(_,r)=>r.trip ? `${r.trip.source} → ${r.trip.destination}` : '—' },
    ...(editable ? [{
      key:'_del', label:'',
      render:(_,row)=>(
        <Button size="icon" variant="ghost" onClick={()=>setDelFuel(row)} className="hover:text-red-400">
          <Trash2 size={14}/>
        </Button>
      )
    }] : [])
  ]

  const expColumns = [
    { key:'vehicle',     label:'Vehicle',  render:(_,r)=>(
      <div>
        <p className="text-slate-200 font-medium text-sm">{r.vehicle?.registrationNumber || '—'}</p>
        <p className="text-xs text-slate-500">{r.vehicle?.vehicleName}</p>
      </div>
    )},
    { key:'expenseDate', label:'Date',     render:v=>formatDate(v) },
    { key:'expenseType', label:'Type',     render:v=>humanize(v) },
    { key:'amount',      label:'Amount',   render:v=>formatCurrency(v) },
    { key:'description', label:'Note',     render:v=>v||'—' },
    { key:'trip',        label:'Trip',     render:(_,r)=>r.trip ? `${r.trip.source} → ${r.trip.destination}` : '—' },
    ...(editable ? [{
      key:'_del', label:'',
      render:(_,row)=>(
        <Button size="icon" variant="ghost" onClick={()=>setDelExp(row)} className="hover:text-red-400">
          <Trash2 size={14}/>
        </Button>
      )
    }] : [])
  ]

  return (
    <div className="space-y-4">
      {/* Tabs + Add button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('fuel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${activeTab === 'fuel' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Fuel size={13}/> Fuel Logs
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${activeTab === 'expenses' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Receipt size={13}/> Other Expenses
          </button>
        </div>

        {editable && (
          activeTab === 'fuel'
            ? <Button onClick={openFuelAdd}><Plus size={15}/> Add Fuel Log</Button>
            : <Button onClick={openExpAdd}><Plus size={15}/> Add Expense</Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        {activeTab === 'fuel' ? (
          <Table
            columns={fuelColumns} data={fuelLogs} loading={fuelLoading}
            emptyMessage="No fuel logs yet."
            currentPage={fuelPage} totalPages={fuelMeta.pages||1} onPageChange={setFuelPage}
          />
        ) : (
          <Table
            columns={expColumns} data={expenses} loading={expLoading}
            emptyMessage="No expenses logged yet."
            currentPage={expPage} totalPages={expMeta.pages||1} onPageChange={setExpPage}
          />
        )}
      </div>

      {/* Fuel Modal */}
      <Modal isOpen={showFuel} onClose={()=>setShowFuel(false)} title="Add Fuel Log" size="md">
        {fuelApiErr && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{fuelApiErr}</div>}
        <FuelForm form={fuelForm} onChange={setFuelField} errors={fuelErrors} vehicles={vehicles} trips={trips}/>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={()=>setShowFuel(false)}>Cancel</Button>
          <Button onClick={handleFuelSave} loading={fuelSaving}>Save Log</Button>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={showExp} onClose={()=>setShowExp(false)} title="Add Expense" size="md">
        {expApiErr && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{expApiErr}</div>}
        <ExpenseForm form={expForm} onChange={setExpField} errors={expErrors} vehicles={vehicles} trips={trips}/>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={()=>setShowExp(false)}>Cancel</Button>
          <Button onClick={handleExpSave} loading={expSaving}>Save Expense</Button>
        </div>
      </Modal>

      {/* Delete fuel */}
      <ConfirmDialog
        isOpen={!!delFuel} onClose={()=>setDelFuel(null)}
        onConfirm={handleDelFuel} loading={delFuelLoad} danger
        title="Delete Fuel Log"
        message="Delete this fuel log entry? This cannot be undone."
        confirmLabel="Delete"
      />

      {/* Delete expense */}
      <ConfirmDialog
        isOpen={!!delExp} onClose={()=>setDelExp(null)}
        onConfirm={handleDelExp} loading={delExpLoad} danger
        title="Delete Expense"
        message="Delete this expense entry? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}