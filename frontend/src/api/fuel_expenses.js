import client from './client'

// Fuel logs
export const listFuel    = (params = {}) => client.get('/api/fuel', { params }).then(r => r.data)
export const createFuel  = (data)        => client.post('/api/fuel', data).then(r => r.data)
export const updateFuel  = (id, data)    => client.put(`/api/fuel/${id}`, data).then(r => r.data)
export const deleteFuel  = (id)          => client.delete(`/api/fuel/${id}`).then(r => r.data)

// Expenses
export const listExpenses   = (params = {}) => client.get('/api/expenses', { params }).then(r => r.data)
export const createExpense  = (data)        => client.post('/api/expenses', data).then(r => r.data)
export const updateExpense  = (id, data)    => client.put(`/api/expenses/${id}`, data).then(r => r.data)
export const deleteExpense  = (id)          => client.delete(`/api/expenses/${id}`).then(r => r.data)
