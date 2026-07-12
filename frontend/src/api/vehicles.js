import client from './client'

export const listVehicles       = (params = {}) => client.get('/api/vehicles', { params }).then(r => r.data)
export const getVehicle         = (id)          => client.get(`/api/vehicles/${id}`).then(r => r.data)
export const getAvailableVehicles = ()          => client.get('/api/vehicles/available').then(r => r.data)
export const createVehicle      = (data)        => client.post('/api/vehicles', data).then(r => r.data)
export const updateVehicle      = (id, data)    => client.put(`/api/vehicles/${id}`, data).then(r => r.data)
export const deleteVehicle      = (id)          => client.delete(`/api/vehicles/${id}`).then(r => r.data)
export const exportVehiclesCsv  = ()            => client.get('/api/export/vehicles/csv', { responseType: 'blob' }).then(r => r.data)
