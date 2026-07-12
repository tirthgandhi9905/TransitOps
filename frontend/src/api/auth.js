import client from './client';

export const login = (email, password) => 
  client.post('/api/auth/login', { email, password }).then(res => res.data);

export const register = (email, password, role) => 
  client.post('/api/auth/register', { email, password, role }).then(res => res.data);

export const getMe = () => 
  client.get('/api/auth/me').then(res => res.data);
