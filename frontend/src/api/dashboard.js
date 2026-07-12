import client from './client'

export const getDashboardKpis   = (params = {}) => client.get('/api/dashboard/kpis', { params }).then(r => r.data)
export const getDashboardAlerts = ()             => client.get('/api/dashboard/alerts').then(r => r.data)
export const getDashboardCharts = ()             => client.get('/api/dashboard/charts').then(r => r.data)
