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

// Role badge — light-mode solid colors
function RoleBadge({ name }) {
  const colors = {
    'Admin':             'bg-red-50     text-red-700     ring-1 ring-red-200',
    'Fleet Manager':     'bg-brand-50   text-brand-700   ring-1 ring-brand-200',
    'Dispatcher':        'bg-blue-50    text-blue-700    ring-1 ring-blue-200',
    'Safety Officer':    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    'Financial Analyst': 'bg-amber-50   text-amber-700   ring-1 ring-amber-200',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colors[name] || 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'}`}>
      <ShieldCheck size={10} />
      {name}
    </span>
  )
}

// Role summary card color bars
const ROLE_COLORS = {
  'Admin':             'bg-red-500',
  'Fleet Manager':     'bg-brand-600',
  'Dispatcher':        'bg-blue-500',
  'Safety Officer':    'bg-emerald-500',
  'Financial Analyst': 'bg-amber-500',
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

  const getRoleName = (u) =>
    typeof u.role === 'object' ? u.role?.name : (u.role || u.roleName)

  const validate = () => {
    const e = {}
    if (!form.name.trim())              e.name     = 'Required'
    if (!form.email.trim())             e.email    = 'Required'
    if (!editing && !form.password)     e.password = 'Required'
    if (!form.roleId)                   e.roleId   = 'Required'
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
        name:   form.name,
        email:  form.email,
        roleId: form.roleId,
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

  const columns = [
    {
      key: 'name', label: 'User', sortable: true,
      render: (v, r) => (
        <div>
          <p className="text-gray-900 font-medium">{v}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      )
    },
    {
      key: 'role', label: 'Role',
      render: (_, r) => <RoleBadge name={getRoleName(r)} />
    },
    {
      key: 'createdAt', label: 'Created',
      render: v => <span className="text-gray-400 text-xs tabular-nums">{formatDate(v)}</span>
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
            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ]

  const ROLE_LABELS = ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">Manage system users and role assignments.</p>
        <Button onClick={openAdd}><Plus size={15} /> Add User</Button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ROLE_LABELS.map(role => {
          const count = users.filter(u => getRoleName(u) === role).length
          return (
            <div key={role} className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
              <div className={`h-0.5 w-full ${ROLE_COLORS[role] || 'bg-gray-300'}`} />
              <div className="px-3 py-2.5">
                <p className="text-xs text-gray-500 truncate">{role}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5 tabular-nums">{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
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
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {apiErr}
          </div>
        )}
        <UserForm
          form={form} onChange={setField}
          errors={errors} roles={roles} isEdit={!!editing}
        />
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-border">
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