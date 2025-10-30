import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, UploadCloud } from 'lucide-react';
import { MetricTrendChart } from './MetricTrendChart';
import { MetricCard } from './MetricCard';
import { useServerHealthMetrics } from '../hooks/useServerHealthMetrics';
import { useMetricHistory } from '../hooks/useMetricHistory';
import type { ServerMetric } from '../types';

const formatTimestamp = (iso?: string) => {
  if (!iso) return 'Sin datos';
  try {
    return new Date(iso).toLocaleString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const ServerHealthDashboard = () => {
  const { data, isLoading, isFetching, isError, refetch } = useServerHealthMetrics();

  const metrics = data?.metrics ?? [];
  const isFallback = data?.isFallback ?? false;

  const { historyByServer, lastUpdatedAt } = useMetricHistory(metrics, { persist: !isFallback });

  const latestMetricMap = useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return new Map<string, ServerMetric>();
    }

    return metrics.reduce((acc, metric) => {
      const observedAt = metric.collected_at ? Date.parse(metric.collected_at) : 0;
      const current = acc.get(metric.server_id);

      if (!current) {
        acc.set(metric.server_id, metric);
        return acc;
      }

      const currentObserved = current.collected_at ? Date.parse(current.collected_at) : 0;
      if (!Number.isNaN(observedAt) && observedAt >= currentObserved) {
        acc.set(metric.server_id, metric);
      }

      return acc;
    }, new Map<string, ServerMetric>());
  }, [metrics]);

  const serverIds = useMemo(() => {
    const ids = Array.from(latestMetricMap.keys());
    ids.sort((a, b) => a.localeCompare(b));
    return ids;
  }, [latestMetricMap]);

  const [selectedServerId, setSelectedServerId] = useState<string>();

  useEffect(() => {
    if (serverIds.length === 0) {
      setSelectedServerId(undefined);
      return;
    }

    setSelectedServerId((current) => {
      if (!current || !serverIds.includes(current)) {
        return serverIds[0];
      }
      return current;
    });
  }, [serverIds]);

  const activeMetric: ServerMetric | undefined = useMemo(() => {
    if (serverIds.length === 0) {
      return undefined;
    }
    const fallback = latestMetricMap.get(serverIds[0]);
    if (!selectedServerId) {
      return fallback;
    }
    return latestMetricMap.get(selectedServerId) ?? fallback;
  }, [latestMetricMap, selectedServerId, serverIds]);

  const chartHistory = useMemo(() => {
    if (!selectedServerId) {
      return [];
    }
    if (isFallback) {
      return [];
    }
    return historyByServer[selectedServerId] ?? [];
  }, [historyByServer, isFallback, selectedServerId]);
  const displayLastUpdated = useMemo(() => {
    if (isFallback) {
      return activeMetric?.collected_at ?? lastUpdatedAt;
    }
    return lastUpdatedAt ?? activeMetric?.collected_at;
  }, [activeMetric, isFallback, lastUpdatedAt]);

  const showFallbackNotice = isFallback && !isError;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
            Server Analytics
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Monitoreo en tiempo real
          </h1>
          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400">
            Visualiza el estado actual y la evolución de tus servidores. Esta vista se actualiza
            automáticamente cada 30 segundos manteniendo la conexión.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Última actualización</p>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              {formatTimestamp(displayLastUpdated)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-500/20 dark:border-brand-500/50 dark:text-brand-300"
            disabled={isFetching}
          >
            <RefreshCw className={isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            {isFetching ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Servidores monitoreados</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Selecciona un servidor para ver sus métricas detalladas y evolución.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="hidden sm:block">Servidor</span>
              <select
                value={selectedServerId ?? ''}
                onChange={(event) => setSelectedServerId(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                disabled={serverIds.length === 0}
              >
                {serverIds.length === 0 ? (
                  <option value="">Sin datos</option>
                ) : (
                  serverIds.map((serverId) => (
                    <option key={serverId} value={serverId}>
                      {serverId}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          {isError && (
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/20">
                  <UploadCloud className="h-5 w-5 text-rose-300" />
                </div>
                <div>
                  <p className="text-base font-semibold text-rose-200">No pudimos contactar la API</p>
                  <p className="text-rose-100">
                    Mostramos métricas simuladas para no perder contexto. Verifica que el backend reciba datos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void refetch();
                }}
                className="rounded-full border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
              >
                Reintentar conexión
              </button>
            </div>
          )}

          {showFallbackNotice && (
            <div className="flex flex-col gap-2 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="font-semibold">Mostramos datos de respaldo</p>
              <p>
                No recibimos métricas en tiempo real del backend. Las cifras visibles son la última lectura disponible
                o un conjunto de referencia hasta que se reestablezca la conexión.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`metric-skeleton-${index}`}
                  className="animate-pulse rounded-2xl border border-slate-200/60 bg-white/50 p-5 dark:border-slate-800/60 dark:bg-slate-900/50"
                >
                  <div className="h-4 w-24 rounded-lg bg-slate-200/80 dark:bg-slate-700/80" />
                  <div className="mt-6 h-8 w-32 rounded-lg bg-slate-200/80 dark:bg-slate-700/80" />
                  <div className="mt-5 flex gap-4">
                    <div className="h-3 w-20 rounded-lg bg-slate-200/70 dark:bg-slate-700/70" />
                    <div className="h-3 w-20 rounded-lg bg-slate-200/70 dark:bg-slate-700/70" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !activeMetric && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No hay lecturas disponibles para este servidor todavía. El panel se actualizará automáticamente al recibir
              nuevas métricas.
            </div>
          )}

          {!isLoading && activeMetric && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard kind="cpu" value={activeMetric.cpu_usage} />
              <MetricCard kind="ram" value={activeMetric.ram_usage} />
              <MetricCard kind="disk" value={activeMetric.disk_space} />
              <MetricCard kind="temperature" value={activeMetric.temperature} />
            </div>
          )}
        </div>

        <MetricTrendChart history={chartHistory} isLoading={isLoading && chartHistory.length === 0} />
      </section>
    </main>
  );
};
