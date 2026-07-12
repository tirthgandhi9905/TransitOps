import React, { useState } from 'react'
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import Table         from '../components/ui/Table'
import Button        from '../components/ui/Button'
import Modal         from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField, { Input, Select } from '../components/ui/FormField'
import useApi        from '../hooks/useApi'
import { toast }     from '../hooks/useToast'
import { listUsers, createUser, updateUser, deleteUser, listRoles } from '../api/users'
import { formatDate } from '../utils/helpers'

const EMPTY = { name: '', email: '', password: '', roleId: '' }

function UserForm({ form, onChange, errors, roles, isEdit }) {
  return (
    <div className="space-y-4">
      <FormField label="Full Name" required error={errors.name}>
        <Input
          value={form.name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="Alex Kumar"
        />
      </FormField>
      <FormField label="Email" required error={errors.email}>
        <Input
          type="email"
          value={form.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="alex@transitops.com"
        />
      </FormField>
      <FormField
        label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
        required={!isEdit}
        error={errors.password}
      >
        <Input
          type="password"
          value={form.password}
          onChange={e => onChange('password', e.target.value)}
          placeholder={isEdit ? '••••••••' : 'Min 6 characters'}
        />
      </FormField>
      <FormField label="Role" required error={errors.roleId}>
        <Select value={form.roleId} onChange={e => onChange('roleId', e.target.value)}>
          <option value="">Select a role…</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>
      </FormField>
    </div>
  )
}

export default function Users() {
  const [showAdd,  setShowAdd]  = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [errors,   setErrors]   = useState({})
  const [saving,   setSaving]   = useState(false)
  const [delLoad,  setDelLoad]  = useState(false)
  const [apiErr,   setApiErr]   = useState('')
  const [page,     setPage]     = useState(1)

  const { data: usersRes, loading, refetch } =
    useApi(() => listUsers({ page, limit: 15 }), [page])

  const { data: rolesRes } = useApi(listRoles)

  const users = usersRes?.data || []
  const meta  = usersRes?.meta || {}
  const roles = rolesRes?.data || []

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Required'
    if (!form.email.trim())   e.email   = 'Required'
    if (!editing && !form.password) e.password = 'Required'
    if (!form.roleId)         e.roleId  = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const openAdd = () => {
    setForm(EMPTY); setErrors({}); setApiErr(''); setShowAdd(true)
  }

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', roleId: u.roleId || '' })
    setErrors({}); setApiErr(''); setEditing(u)
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true); setApiErr('')
    try {
      const payload = {
        name:     form.name,
        email:    form.email,
        roleId:   form.roleId,
        ...(form.password ? { password: form.password } : {}),
      }
      if (editing) {
        await updateUser(editing.id, payload)
        toast('User updated.', 'success')
      } else {
        await createUser(payload)
        toast('User created.', 'success')
      }
      setShowAdd(false); setEditing(null); refetch()
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Save failed'
      setApiErr(msg); toast(msg, 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDelLoad(true)
    try {
      await deleteUser(deleting.id)
      toast('User removed.', 'success')
      setDeleting(null); refetch()
    } catch (err) {
      toast(err.response?.data?.error?.message || 'Delete failed', 'error')
      setDeleting(null)
    } finally { setDelLoad(false) }
  }

  // Role name badge
  const RoleBadge = ({ name }) => {
    const colors = {
      'Admin':             'bg-red-500/15 text-red-400',
      'Fleet Manager':     'bg-indigo-500/15 text-indigo-400',
      'Dispatcher':        'bg-blue-500/15 text-blue-400',
      'Safety Officer':    'bg-emerald-500/15 text-emerald-400',
      'Financial Analyst': 'bg-amber-500/15 text-amber-400',
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colors[name] || 'bg-slate-500/15 text-slate-400'}`}>
        <ShieldCheck size={10} />
        {name}
      </span>
    )
  }

  const columns = [
    {
      key: 'name', label: 'User', sortable: true,
      render: (v, r) => (
        <div>
          <p className="text-slate-200 font-medium">{v}</p>
          <p className="text-xs text-slate-500">{r.email}</p>
        </div>
      )
    },
    {
      key: 'role', label: 'Role',
      render: (_, r) => <RoleBadge name={typeof r.role === "object" ? r.role?.name : (r.role || r.roleName)} />
    },
    {
      key: 'createdAt', label: 'Created',
      render: v => <span className="text-slate-400 text-xs">{formatDate(v)}</span>
    },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <div className="flex gap-1.5 justify-end">
          <Button size="icon" variant="ghost" onClick={() => openEdit(row)}>
            <Pencil size={14} />
          </Button>
          <Button
            size="icon" variant="ghost"
            onClick={() => setDeleting(row)}
            className="hover:text-red-400"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Manage system users and role assignments.</p>
        </div>
        <Button onClick={openAdd}><Plus size={15} /> Add User</Button>
      </div>

      {/* Roles summary */}
      <div className="grid grid-cols-5 gap-3">
        {['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map(role => {
          const count = users.filter(u => (typeof u.role === "object" ? u.role?.name : (u.role || u.roleName)) === role).length
          return (
            <div key={role} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5">
              <p className="text-xs text-slate-500 truncate">{role}</p>
              <p className="text-lg font-bold text-slate-100 mt-0.5">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <Table
          columns={columns} data={users} loading={loading}
          emptyMessage="No users found."
          currentPage={page} totalPages={meta.pages || 1} onPageChange={setPage}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAdd || !!editing}
        onClose={() => { setShowAdd(false); setEditing(null) }}
        title={editing ? 'Edit User' : 'Add User'}
        size="md"
      >
        {apiErr && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {apiErr}
          </div>
        )}
        <UserForm
          form={form} onChange={setField}
          errors={errors} roles={roles} isEdit={!!editing}
        />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => { setShowAdd(false); setEditing(null) }}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {editing ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={handleDelete} loading={delLoad} danger
        title="Remove User"
        message={`Remove "${deleting?.name}"? They will no longer be able to log in.`}
        confirmLabel="Remove"
      />
    </div>
  )
}