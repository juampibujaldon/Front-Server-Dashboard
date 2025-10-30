import { API_BASE_URLS } from '../../config/env';
import type { ServerMetric } from './types';

export const SERVER_METRICS_ENDPOINTS = API_BASE_URLS.map((baseUrl) => `${baseUrl}/metrics`);

export const FALLBACK_METRICS: ServerMetric[] = [
  {
    cpu_usage: 40.706745,
    disk_space: 52.673435,
    id: '68fa3355d02bad56e414112a',
    ram_usage: 88.14929,
    server_id: 'server-db-01',
    temperature: 59.26354,
  },
  {
    cpu_usage: 35.120456,
    disk_space: 61.88903,
    id: '68fa3355d02bad56e414112b',
    ram_usage: 72.44112,
    server_id: 'server-api-01',
    temperature: 55.81432,
  },
  {
    cpu_usage: 22.87491,
    disk_space: 81.99101,
    id: '68fa3355d02bad56e414112c',
    ram_usage: 48.00824,
    server_id: 'server-web-01',
    temperature: 47.10528,
  },
];
