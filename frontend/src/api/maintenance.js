import client from './client';

export const listMaintenanceLogs = () => 
  client.get('/api/maintenance').then(res => res.data);

export const createMaintenanceLog = (data) => 
  client.post('/api/maintenance', data).then(res => res.data);

export const closeMaintenanceLog = (id) => 
  client.post(`/api/maintenance/${id}/close`).then(res => res.data);
