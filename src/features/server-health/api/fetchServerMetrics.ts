import { FALLBACK_METRICS, SERVER_METRICS_ENDPOINT } from '../constants';
import type { ServerMetric } from '../types';

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `metric-${Math.random().toString(36).slice(2, 10)}`;
};

const sanitizeMetric = (metric: Partial<ServerMetric>): ServerMetric => ({
  cpu_usage: Number(metric.cpu_usage ?? 0),
  disk_space: Number(metric.disk_space ?? 0),
  id: String(metric.id ?? generateId()),
  ram_usage: Number(metric.ram_usage ?? 0),
  server_id: String(metric.server_id ?? 'desconocido'),
  temperature: Number(metric.temperature ?? 0),
  created_at: metric.created_at,
  updated_at: metric.updated_at,
  collected_at: metric.collected_at,
  timestamp: metric.timestamp,
});

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const observedAtFromId = (id: string) => {
  if (!isObjectId(id)) {
    return undefined;
  }
  const seconds = parseInt(id.slice(0, 8), 16);
  if (Number.isNaN(seconds)) {
    return undefined;
  }
  return new Date(seconds * 1000).toISOString();
};

const withObservedTimestamp = (metric: ServerMetric): ServerMetric => {
  const observedAt =
    metric.timestamp ??
    metric.collected_at ??
    metric.updated_at ??
    metric.created_at ??
    observedAtFromId(metric.id) ??
    new Date().toISOString();

  return {
    ...metric,
    collected_at: observedAt,
  };
};

const handleFallback = (): ServerMetric[] =>
  FALLBACK_METRICS.map((metric) => withObservedTimestamp(sanitizeMetric(metric)));

const sortByObservedAt = (metrics: ServerMetric[]) =>
  metrics
    .slice()
    .sort((a, b) => {
      const aTime = a.collected_at ? Date.parse(a.collected_at) : 0;
      const bTime = b.collected_at ? Date.parse(b.collected_at) : 0;
      return aTime - bTime;
    });

export const fetchServerHealthMetrics = async (signal?: AbortSignal): Promise<ServerMetric[]> => {
  try {
    const response = await fetch(SERVER_METRICS_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Solicitud fallida con estado ${response.status}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error('La respuesta del backend no es una lista de métricas');
    }

    const uniqueById = new Map<string, ServerMetric>();
    payload.forEach((item) => {
      const normalized = withObservedTimestamp(sanitizeMetric(item));
      uniqueById.set(normalized.id, normalized);
    });

    return sortByObservedAt(Array.from(uniqueById.values()));
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    console.warn('[server-health] Fallback a métricas simuladas por error en la API', error);
    return handleFallback();
  }
};
