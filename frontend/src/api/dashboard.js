import client from './client';

export const getDashboardKpis = (filters = {}) => 
  client.get('/api/dashboard/kpis', { params: filters }).then(res => res.data);
