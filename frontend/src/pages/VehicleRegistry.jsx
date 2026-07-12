import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'
import Table         from '../components/ui/Table'
import StatusBadge   from '../components/ui/StatusBadge'
import Button        from '../components/ui/Button'
import SearchFilter  from '../components/ui/SearchFilter'
import Modal         from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField, { Input, Select } from '../components/ui/FormField'
import useApi        from '../hooks/useApi'
import { toast } from '../hooks/useToast'
import useAuth       from '../hooks/useAuth'
import { listVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles'
import { VEHICLE_STATUS, VEHICLE_TYPES } from '../utils/constants'
import { formatCurrency, formatNumber, formatDate } from '../utils/helpers'

const EMPTY = {
  registrationNumber:'', vehicleName:'', vehicleModel:'', vehicleType:'VAN',
  maxLoadCapacity:'', currentOdometer:'0', acquisitionCost:'', region:'', notes:''
}

function VehicleForm({ form, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Registration No." required error={errors.registrationNumber}>
          <Input value={form.registrationNumber} onChange={e=>onChange('registrationNumber',e.target.value)} placeholder="VAN-05" />
        </FormField>
        <FormField label="Vehicle Type" required>
          <Select value={form.vehicleType} onChange={e=>onChange('vehicleType',e.target.value)}>
            {VEHICLE_TYPES.map(t=><option key={t}>{t}</option>)}
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Vehicle Name / Model" required error={errors.vehicleName}>
          <Input value={form.vehicleName} onChange={e=>onChange('vehicleName',e.target.value)} placeholder="Ford Transit" />
        </FormField>
        <FormField label="Model Variant">
          <Input value={form.vehicleModel} onChange={e=>onChange('vehicleModel',e.target.value)} placeholder="Transit 350" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Max Load (kg)" required error={errors.maxLoadCapacity}>
          <Input type="number" value={form.maxLoadCapacity} onChange={e=>onChange('maxLoadCapacity',e.target.value)} placeholder="500" />
        </FormField>
        <FormField label="Odometer (km)">
          <Input type="number" value={form.currentOdometer} onChange={e=>onChange('currentOdometer',e.target.value)} placeholder="0" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Acquisition Cost (₹)" required error={errors.acquisitionCost}>
          <Input type="number" value={form.acquisitionCost} onChange={e=>onChange('acquisitionCost',e.target.value)} placeholder="35000" />
        </FormField>
        <FormField label="Region">
          <Input value={form.region} onChange={e=>onChange('region',e.target.value)} placeholder="North" />
        </FormField>
      </div>
      <FormField label="Notes">
        <Input value={form.notes} onChange={e=>onChange('notes',e.target.value)} placeholder="Optional notes" />
      </FormField>
    </div>
  )
}

export default function VehicleRegistry() {
  const { canEdit } = useAuth()
  const editable    = canEdit('Vehicles')

  const [search,   setSearch]   = useState('')
  const [statusF,  setStatusF]  = useState('')
  const [typeF,    setTypeF]    = useState('')
  const [page,     setPage]     = useState(1)
  const [showAdd,  setShowAdd]  = useState(false)
  const [editing,  setEditing]  = useState(null)   // vehicle obj
  const [deleting, setDeleting] = useState(null)   // vehicle obj
  const [form,     setForm]     = useState(EMPTY)
  const [errors,   setErrors]   = useState({})
  const [saving,   setSaving]   = useState(false)
  const [delLoading, setDelLoading] = useState(false)
  const [apiErr,   setApiErr]   = useState('')

  const params = { search, status: statusF, vehicleType: typeF, page, limit: 15 }
  const { data: res, loading, refetch } = useApi(() => listVehicles(params), [search, statusF, typeF, page])

  const vehicles   = res?.data || []
  const meta       = res?.meta || {}

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.registrationNumber.trim()) e.registrationNumber = 'Required'
    if (!form.vehicleName.trim())        e.vehicleName        = 'Required'
    if (!form.maxLoadCapacity)           e.maxLoadCapacity    = 'Required'
    if (!form.acquisitionCost)           e.acquisitionCost    = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const openAdd = () => { setForm(EMPTY); setErrors({}); setApiErr(''); setShowAdd(true) }
  const openEdit = (v) => {
    setForm({
      registrationNumber: v.registrationNumber, vehicleName: v.vehicleName,
      vehicleModel: v.vehicleModel || '', vehicleType: v.vehicleType,
      maxLoadCapacity: v.maxLoadCapacity, currentOdometer: v.currentOdometer || 0,
      acquisitionCost: v.acquisitionCost, region: v.region || '', notes: v.notes || ''
    })
    setErrors({}); setApiErr(''); setEditing(v)
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true); setApiErr('')
    try {
      if (editing) {
        await updateVehicle(editing.id, form)
      } else {
        await createVehicle(form)
      }
      setShowAdd(false); setEditing(null); refetch()
      toast(editing ? 'Vehicle updated.' : 'Vehicle added.', 'success')
    } catch(err) {
      const msg = err.response?.data?.error?.message || 'Save failed'
      setApiErr(msg); toast(msg, 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await deleteVehicle(deleting.id)
      setDeleting(null); refetch()
    } catch(err) {
      setDeleting(null)
    } finally { setDelLoading(false) }
  }

  const columns = [
    { key:'registrationNumber', label:'Reg. No.', sortable:true },
    { key:'vehicleName',        label:'Name / Model', render:(v,r)=>(
      <div><p className="text-slate-200 font-medium">{v}</p><p className="text-xs text-slate-500">{r.vehicleModel}</p></div>
    )},
    { key:'vehicleType',  label:'Type' },
    { key:'maxLoadCapacity', label:'Capacity', render:v=>`${formatNumber(v)} kg` },
    { key:'currentOdometer', label:'Odometer',  render:v=>`${formatNumber(v)} km` },
    { key:'acquisitionCost', label:'Acq. Cost', render:v=>formatCurrency(v) },
    { key:'status', label:'Status', render:v=><StatusBadge status={v} /> },
    ...(editable ? [{
      key:'_actions', label:'',
      render:(_,row)=>(
        <div className="flex gap-1.5 justify-end">
          <Button size="icon" variant="ghost" onClick={()=>openEdit(row)}><Pencil size={14}/></Button>
          <Button size="icon" variant="ghost" onClick={()=>setDeleting(row)} className="hover:text-red-500">
            <Trash2 size={14}/>
          </Button>
        </div>
      )
    }] : [])
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchFilter
          search={search} onSearch={v=>{setSearch(v);setPage(1)}}
          filters={[
            { key:'status', value:statusF, onChange:v=>{setStatusF(v);setPage(1)}, placeholder:'All Statuses',
              options: Object.values(VEHICLE_STATUS).map(s=>({ value:s, label:s.replace('_',' ') })) },
            { key:'type', value:typeF, onChange:v=>{setTypeF(v);setPage(1)}, placeholder:'All Types',
              options: VEHICLE_TYPES.map(t=>({ value:t, label:t })) },
          ]}
        />
        {editable && (
          <Button onClick={openAdd}><Plus size={15}/> Add Vehicle</Button>
        )}
      </div>

      {/* Table card */}
      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
        <Table
          columns={columns} data={vehicles} loading={loading}
          emptyMessage="No vehicles found."
          currentPage={page} totalPages={meta.pages || 1} onPageChange={setPage}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAdd || !!editing}
        onClose={()=>{ setShowAdd(false); setEditing(null) }}
        title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        size="lg"
      >
        {apiErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{apiErr}</div>
        )}
        <VehicleForm form={form} onChange={setField} errors={errors} />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={()=>{ setShowAdd(false); setEditing(null) }}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Add Vehicle'}</Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={()=>setDeleting(null)}
        onConfirm={handleDelete}
        loading={delLoading}
        danger
        title="Delete Vehicle"
        message={`Delete "${deleting?.registrationNumber}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}