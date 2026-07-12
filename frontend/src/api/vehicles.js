import client from './client';

export const listVehicles = (filters = {}) => 
  client.get('/api/vehicles', { params: filters }).then(res => res.data);

export const getVehicle = (id) => 
  client.get(`/api/vehicles/${id}`).then(res => res.data);

export const createVehicle = (data) => 
  client.post('/api/vehicles', data).then(res => res.data);

export const updateVehicle = (id, data) => 
  client.put(`/api/vehicles/${id}`, data).then(res => res.data);

export const deleteVehicle = (id) => 
  client.delete(`/api/vehicles/${id}`).then(res => res.data);
