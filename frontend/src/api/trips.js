import client from './client';

export const listTrips = (filters = {}) => 
  client.get('/api/trips', { params: filters }).then(res => res.data);

export const createTrip = (data) => 
  client.post('/api/trips', data).then(res => res.data);

export const dispatchTrip = (id) => 
  client.post(`/api/trips/${id}/dispatch`).then(res => res.data);

export const completeTrip = (id, actualDistance, fuelConsumed, fuelCostPerLiter = 1.50) => 
  client.post(`/api/trips/${id}/complete`, { 
    actual_distance: actualDistance, 
    fuel_consumed: fuelConsumed,
    fuel_cost_per_liter: fuelCostPerLiter
  }).then(res => res.data);

export const cancelTrip = (id) => 
  client.post(`/api/trips/${id}/cancel`).then(res => res.data);
