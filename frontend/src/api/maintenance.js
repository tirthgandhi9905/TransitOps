import client from './client'

export const listMaintenance    = (params = {}) => client.get('/api/maintenance', { params }).then(r => r.data)
export const getMaintenance     = (id)          => client.get(`/api/maintenance/${id}`).then(r => r.data)
export const createMaintenance  = (data)        => client.post('/api/maintenance', data).then(r => r.data)
export const updateMaintenance  = (id, data)    => client.put(`/api/maintenance/${id}`, data).then(r => r.data)
export const closeMaintenance   = (id)          => client.post(`/api/maintenance/${id}/close`).then(r => r.data)
export const deleteMaintenance  = (id)          => client.delete(`/api/maintenance/${id}`).then(r => r.data)
