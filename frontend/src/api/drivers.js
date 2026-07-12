import client from './client';

export const listDrivers = (filters = {}) => 
  client.get('/api/drivers', { params: filters }).then(res => res.data);

export const getDriver = (id) => 
  client.get(`/api/drivers/${id}`).then(res => res.data);

export const createDriver = (data) => 
  client.post('/api/drivers', data).then(res => res.data);

export const updateDriver = (id, data) => 
  client.put(`/api/drivers/${id}`, data).then(res => res.data);

export const deleteDriver = (id) => 
  client.delete(`/api/drivers/${id}`).then(res => res.data);
