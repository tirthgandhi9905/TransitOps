import client from './client';

export const listFuelLogs = () => 
  client.get('/api/fuel-expenses/fuel').then(res => res.data);

export const createFuelLog = (data) => 
  client.post('/api/fuel-expenses/fuel', data).then(res => res.data);

export const listExpenses = () => 
  client.get('/api/fuel-expenses/expenses').then(res => res.data);

export const createExpense = (data) => 
  client.post('/api/fuel-expenses/expenses', data).then(res => res.data);
