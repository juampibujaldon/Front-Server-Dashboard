import { useEffect, useMemo, useState } from 'react';
import type { ServerMetric, ServerMetricPoint } from '../types';

const STORAGE_KEY = 'server-health-history-v3';

type StoredHistory = {
  lastUpdatedAt?: string;
  historyByServer: Record<string, ServerMetricPoint[]>;
};

const getObservedAt = (metric: ServerMetric, fallback: string) =>
  metric.timestamp ?? metric.collected_at ?? metric.updated_at ?? metric.created_at ?? fallback;

const readFromStorage = (): StoredHistory => {
  if (typeof window === 'undefined') {
    return { historyByServer: {}, lastUpdatedAt: undefined };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { historyByServer: {}, lastUpdatedAt: undefined };
    }
    const parsed = JSON.parse(raw) as StoredHistory;
    if (!parsed || typeof parsed !== 'object') {
      return { historyByServer: {}, lastUpdatedAt: undefined };
    }

    const historyByServer = Object.fromEntries(
      Object.entries(parsed.historyByServer ?? {}).map(([serverId, points]) => [
        serverId,
        Array.isArray(points)
          ? points
              .map((point) => ({
                ...point,
                observedAt: point.observedAt ?? getObservedAt(point, new Date().toISOString()),
              }))
              .sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt))
          : [],
      ]),
    );

    return {
      historyByServer,
      lastUpdatedAt: parsed.lastUpdatedAt,
    };
  } catch {
    return { historyByServer: {}, lastUpdatedAt: undefined };
  }
};

const writeToStorage = (payload: StoredHistory) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignoramos errores de almacenamiento (p.ej. modo incógnito sin permiso)
  }
};

const mergeHistory = (
  previous: Record<string, ServerMetricPoint[]>,
  metrics: ServerMetric[],
  fallbackTimestamp: string,
) => {
  const next = { ...previous };
  let newest = fallbackTimestamp;

  metrics.forEach((metric) => {
    const observedAt = getObservedAt(metric, fallbackTimestamp);
    const entry: ServerMetricPoint = {
      ...metric,
      observedAt,
    };

    const history = next[metric.server_id] ? [...next[metric.server_id]] : [];

    const duplicateIndex = history.findIndex(
      (point) => point.id === entry.id || point.observedAt === entry.observedAt,
    );

    if (duplicateIndex >= 0) {
      history[duplicateIndex] = entry;
    } else {
      history.push(entry);
    }

    history.sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));
    next[metric.server_id] = history;

    const observedMs = Date.parse(entry.observedAt);
    if (!Number.isNaN(observedMs)) {
      const newestMs = Date.parse(newest);
      if (Number.isNaN(newestMs) || observedMs > newestMs) {
        newest = new Date(observedMs).toISOString();
      }
    }
  });

  return { historyByServer: next, lastUpdatedAt: newest };
};

export const useMetricHistory = (metrics: ServerMetric[] | undefined) => {
  const cached = useMemo(readFromStorage, []);
  const [historyByServer, setHistoryByServer] = useState<Record<string, ServerMetricPoint[]>>(
    cached.historyByServer,
  );
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | undefined>(cached.lastUpdatedAt);

  useEffect(() => {
    if (!metrics || metrics.length === 0) {
      return;
    }

    const fallbackTimestamp = new Date().toISOString();
    setHistoryByServer((previous) => {
      const snapshot = mergeHistory(previous, metrics, fallbackTimestamp);
      setLastUpdatedAt(snapshot.lastUpdatedAt);
      writeToStorage(snapshot);
      return snapshot.historyByServer;
    });
  }, [metrics]);

  return { historyByServer, lastUpdatedAt };
};
