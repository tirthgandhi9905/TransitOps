import client from './client'

export const listDrivers         = (params = {}) => client.get('/api/drivers', { params }).then(r => r.data)
export const getDriver           = (id)          => client.get(`/api/drivers/${id}`).then(r => r.data)
export const getAvailableDrivers = ()            => client.get('/api/drivers/available').then(r => r.data)
export const getExpiringDrivers  = ()            => client.get('/api/drivers/expiring-soon').then(r => r.data)
export const createDriver        = (data)        => client.post('/api/drivers', data).then(r => r.data)
export const updateDriver        = (id, data)    => client.put(`/api/drivers/${id}`, data).then(r => r.data)
export const deleteDriver        = (id)          => client.delete(`/api/drivers/${id}`).then(r => r.data)
export const exportDriversCsv    = ()            => client.get('/api/export/drivers/csv', { responseType: 'blob' }).then(r => r.data)
