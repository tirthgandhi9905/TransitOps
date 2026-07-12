import client from './client';

export const getReportsSummary = () => 
  client.get('/api/reports/summary').then(res => res.data);

export const exportReportsCsvUrl = '/api/reports/export/csv';
