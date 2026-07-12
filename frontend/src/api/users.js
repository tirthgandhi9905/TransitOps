import client from './client'

// Backend expects snake_case for create/update
const toSnake = (data) => ({
  name:     data.name,
  email:    data.email,
  role_id:  data.roleId,
  ...(data.password ? { password: data.password } : {}),
})

export const listUsers  = (params = {}) => client.get('/api/users', { params }).then(r => r.data)
export const createUser = (data)        => client.post('/api/users', toSnake(data)).then(r => r.data)
export const updateUser = (id, data)    => client.put(`/api/users/${id}`, toSnake(data)).then(r => r.data)
export const deleteUser = (id)          => client.delete(`/api/users/${id}`).then(r => r.data)
export const listRoles  = ()            => client.get('/api/roles').then(r => r.data)