import React, { useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react'
import Table         from '../components/ui/Table'
import StatusBadge   from '../components/ui/StatusBadge'
import Button        from '../components/ui/Button'
import SearchFilter  from '../components/ui/SearchFilter'
import Modal         from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField, { Input, Select } from '../components/ui/FormField'
import useApi        from '../hooks/useApi'
import useAuth       from '../hooks/useAuth'
import { listDrivers, createDriver, updateDriver, deleteDriver } from '../api/drivers'
import { DRIVER_STATUS, LICENSE_CATEGORIES } from '../utils/constants'
import { formatDate, daysUntil, isLicenseExpired, isLicenseExpiringSoon } from '../utils/helpers'

const EMPTY = {
  name:'', licenseNumber:'', licenseCategory:'B', licenseExpiry:'',
  phone:'', email:'', safetyScore:'8', notes:''
}

function SafetyScore({ score }) {
  const n = parseFloat(score)
  const color = n >= 8 ? 'text-emerald-400' : n >= 5 ? 'text-amber-400' : 'text-red-400'
  return <span className={`font-semibold ${color}`}>{n.toFixed(1)}</span>
}

function LicenseExpiry({ date }) {
  const days = daysUntil(date)
  if (isLicenseExpired(date)) {
    return <span className="text-red-400 text-xs font-medium flex items-center gap-1"><AlertTriangle size={11}/>Expired</span>
  }
  if (isLicenseExpiringSoon(date)) {
    return <span className="text-amber-400 text-xs font-medium flex items-center gap-1"><AlertTriangle size={11}/>{days}d left</span>
  }
  return <span className="text-slate-400 text-xs">{formatDate(date)}</span>
}

function DriverForm({ form, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Full Name" required error={errors.name} className="col-span-2">
          <Input value={form.name} onChange={e=>onChange('name',e.target.value)} placeholder="Alex Kumar" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="License Number" required error={errors.licenseNumber}>
          <Input value={form.licenseNumber} onChange={e=>onChange('licenseNumber',e.target.value)} placeholder="DL-MH-001234" />
        </FormField>
        <FormField label="License Category">
          <Select value={form.licenseCategory} onChange={e=>onChange('licenseCategory',e.target.value)}>
            {LICENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="License Expiry" required error={errors.licenseExpiry}>
          <Input type="date" value={form.licenseExpiry} onChange={e=>onChange('licenseExpiry',e.target.value)} />
        </FormField>
        <FormField label="Safety Score (0–10)">
          <Input type="number" min="0" max="10" step="0.1"
            value={form.safetyScore} onChange={e=>onChange('safetyScore',e.target.value)} placeholder="8.0" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Phone">
          <Input value={form.phone} onChange={e=>onChange('phone',e.target.value)} placeholder="+91-9876543210" />
        </FormField>
        <FormField label="Email">
          <Input type="email" value={form.email} onChange={e=>onChange('email',e.target.value)} placeholder="alex@example.com" />
        </FormField>
      </div>
      <FormField label="Notes">
        <Input value={form.notes} onChange={e=>onChange('notes',e.target.value)} placeholder="Optional" />
      </FormField>
    </div>
  )
}

export default function DriverManagement() {
  const { canEdit } = useAuth()
  const editable    = canEdit('Drivers')

  const [search,  setSearch]  = useState('')
  const [statusF, setStatusF] = useState('')
  const [catF,    setCatF]    = useState('')
  const [page,    setPage]    = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting,setDeleting]= useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [delLoad, setDelLoad] = useState(false)
  const [apiErr,  setApiErr]  = useState('')

  const params = { search, status: statusF, licenseCategory: catF, page, limit: 15 }
  const { data: res, loading, refetch } = useApi(() => listDrivers(params), [search, statusF, catF, page])

  const drivers = res?.data || []
  const meta    = res?.meta || {}

  const setField = (k,v) => setForm(f=>({...f,[k]:v}))

  const validate = () => {
    const e = {}
    if (!form.name.trim())          e.name          = 'Required'
    if (!form.licenseNumber.trim()) e.licenseNumber = 'Required'
    if (!form.licenseExpiry)        e.licenseExpiry = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const openAdd = () => { setForm(EMPTY); setErrors({}); setApiErr(''); setShowAdd(true) }
  const openEdit = (d) => {
    setForm({
      name: d.name, licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory || 'B',
      licenseExpiry: d.licenseExpiry?.slice(0,10) || '',
      phone: d.phone || '', email: d.email || '',
      safetyScore: d.safetyScore ?? 8, notes: d.notes || ''
    })
    setErrors({}); setApiErr(''); setEditing(d)
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true); setApiErr('')
    try {
      editing ? await updateDriver(editing.id, form) : await createDriver(form)
      setShowAdd(false); setEditing(null); refetch()
    } catch(err) {
      setApiErr(err.response?.data?.error?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDelLoad(true)
    try { await deleteDriver(deleting.id); setDeleting(null); refetch() }
    catch { setDeleting(null) }
    finally { setDelLoad(false) }
  }

  const columns = [
    { key:'name', label:'Driver', sortable:true, render:(v,r)=>(
      <div>
        <p className="text-slate-200 font-medium">{v}</p>
        <p className="text-xs text-slate-500">{r.licenseNumber}</p>
      </div>
    )},
    { key:'licenseCategory', label:'Category', render:v=>(
      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono">{v}</span>
    )},
    { key:'licenseExpiry', label:'Expiry', render:v=><LicenseExpiry date={v} /> },
    { key:'safetyScore',   label:'Safety', render:v=>(
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-slate-500" />
        <SafetyScore score={v} />
        <span className="text-slate-500 text-xs">/ 10</span>
      </div>
    )},
    { key:'phone',  label:'Phone',  render:v=>v||'—' },
    { key:'status', label:'Status', render:v=><StatusBadge status={v} /> },
    ...(editable ? [{
      key:'_actions', label:'',
      render:(_,row)=>(
        <div className="flex gap-1.5 justify-end">
          <Button size="icon" variant="ghost" onClick={()=>openEdit(row)}><Pencil size={14}/></Button>
          <Button size="icon" variant="ghost" onClick={()=>setDeleting(row)} className="hover:text-red-400">
            <Trash2 size={14}/>
          </Button>
        </div>
      )
    }] : [])
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchFilter
          search={search} onSearch={v=>{setSearch(v);setPage(1)}}
          filters={[
            { key:'status', value:statusF, onChange:v=>{setStatusF(v);setPage(1)}, placeholder:'All Statuses',
              options: Object.values(DRIVER_STATUS).map(s=>({ value:s, label:s.replace('_',' ') })) },
            { key:'category', value:catF, onChange:v=>{setCatF(v);setPage(1)}, placeholder:'All Categories',
              options: LICENSE_CATEGORIES.map(c=>({ value:c, label:`Cat. ${c}` })) },
          ]}
        />
        {editable && <Button onClick={openAdd}><Plus size={15}/>Add Driver</Button>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <Table
          columns={columns} data={drivers} loading={loading}
          emptyMessage="No drivers found."
          currentPage={page} totalPages={meta.pages||1} onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={showAdd || !!editing}
        onClose={()=>{ setShowAdd(false); setEditing(null) }}
        title={editing ? 'Edit Driver' : 'Add Driver'}
        size="lg"
      >
        {apiErr && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{apiErr}</div>}
        <DriverForm form={form} onChange={setField} errors={errors} />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={()=>{ setShowAdd(false); setEditing(null) }}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Add Driver'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting} onClose={()=>setDeleting(null)}
        onConfirm={handleDelete} loading={delLoad} danger
        title="Delete Driver"
        message={`Delete driver "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
