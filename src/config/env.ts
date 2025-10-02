const fallbackBaseUrl = 'http://localhost:5000/api';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? fallbackBaseUrl;

export const REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_REFRESH_INTERVAL_MS ?? 15000);

export const METRIC_STALE_THRESHOLD_MS = Number(import.meta.env.VITE_METRIC_STALE_THRESHOLD_MS ?? 30000);
