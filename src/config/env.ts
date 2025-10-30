const fallbackBaseUrls = ['http://localhost:5001/api', 'http://localhost:5000/api'];

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

const normalizeBase = (url: string) => url.replace(/\s/g, '').replace(/\/+$/, '');

const envBaseUrls = envBaseUrl
  ?.split(',')
  .map((url) => url.trim())
  .filter((url) => url.length > 0)
  .map(normalizeBase);

const composeBaseUrls = () => {
  if (envBaseUrls && envBaseUrls.length > 0) {
    return Array.from(new Set(envBaseUrls));
  }
  return fallbackBaseUrls.map(normalizeBase);
};

export const API_BASE_URLS = composeBaseUrls();
export const API_BASE_URL = API_BASE_URLS[0];

export const REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_REFRESH_INTERVAL_MS ?? 30000);

export const METRIC_STALE_THRESHOLD_MS = Number(import.meta.env.VITE_METRIC_STALE_THRESHOLD_MS ?? 30000);
