import client from './client'

export const listTrips    = (params = {}) => client.get('/api/trips', { params }).then(r => r.data)
export const getTrip      = (id)          => client.get(`/api/trips/${id}`).then(r => r.data)
export const createTrip   = (data)        => client.post('/api/trips', data).then(r => r.data)
export const updateTrip   = (id, data)    => client.put(`/api/trips/${id}`, data).then(r => r.data)
export const deleteTrip   = (id)          => client.delete(`/api/trips/${id}`).then(r => r.data)
export const dispatchTrip = (id)          => client.post(`/api/trips/${id}/dispatch`).then(r => r.data)
export const completeTrip = (id, data)    => client.post(`/api/trips/${id}/complete`, data).then(r => r.data)
export const cancelTrip   = (id)          => client.post(`/api/trips/${id}/cancel`).then(r => r.data)
export const exportTripsCsv = ()          => client.get('/api/export/trips/csv', { responseType: 'blob' }).then(r => r.data)
