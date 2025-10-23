import { useEffect, useMemo, useState } from 'react';
import type { ServerMetric, ServerMetricPoint } from '../types';

const STORAGE_KEY = 'server-health-history-v2';

type StoredHistory = {
  lastUpdatedAt?: string;
  historyByServer: Record<string, ServerMetricPoint[]>;
};

const getObservedAt = (metric: ServerMetric, fallback: string) =>
  metric.timestamp ?? metric.collected_at ?? metric.updated_at ?? metric.created_at ?? fallback;

const buildHistory = (metrics: ServerMetric[], fallbackTimestamp: string): StoredHistory => {
  const historyByServer = metrics.reduce<Record<string, ServerMetricPoint[]>>((acc, metric) => {
    const serverId = metric.server_id;
    const observedAt = getObservedAt(metric, fallbackTimestamp);
    const entry: ServerMetricPoint = {
      ...metric,
      observedAt,
    };

    const existing = acc[serverId] ? [...acc[serverId]] : [];
    const replacedIndex = existing.findIndex((item) => item.observedAt === observedAt);

    if (replacedIndex >= 0) {
      existing[replacedIndex] = entry;
    } else {
      existing.push(entry);
    }

    existing.sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt));

    acc[serverId] = existing;
    return acc;
  }, {});

  const newestTimestamp = Object.values(historyByServer)
    .flat()
    .reduce<string | undefined>((latest, entry) => {
      const currentTs = Date.parse(entry.observedAt);
      if (Number.isNaN(currentTs)) {
        return latest;
      }
      if (!latest) {
        return entry.observedAt;
      }
      return Date.parse(latest) < currentTs ? entry.observedAt : latest;
    }, undefined);

  return { historyByServer, lastUpdatedAt: newestTimestamp ?? fallbackTimestamp };
};

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
    const snapshot = buildHistory(metrics, fallbackTimestamp);

    setHistoryByServer(snapshot.historyByServer);
    setLastUpdatedAt(snapshot.lastUpdatedAt);
    writeToStorage(snapshot);
  }, [metrics]);

  return { historyByServer, lastUpdatedAt };
};
