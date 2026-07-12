import client from './client'

export const getFuelEfficiency   = () => client.get('/api/reports/fuel-efficiency').then(r => r.data)
export const getOperationalCost  = () => client.get('/api/reports/operational-cost').then(r => r.data)
export const getVehicleROI       = () => client.get('/api/reports/vehicle-roi').then(r => r.data)
export const getFleetUtilization = () => client.get('/api/reports/fleet-utilization').then(r => r.data)
export const exportReportCsv     = () => client.get('/api/export/report/csv', { responseType: 'blob' }).then(r => r.data)
