import { useQuery } from '@tanstack/react-query';
import { MONITORED_SERVERS } from '../config/servers';
import { REFRESH_INTERVAL_MS } from '../config/env';
import { adaptServerMetric } from '../domain/adapters/metricAdapter';
import type { ServerMetricViewModel } from '../domain/models';
import { MetricsService } from '../services/MetricsService';

const buildDisconnected = (configId: string, name: string, reason: string): ServerMetricViewModel => ({
  serverId: configId,
  serverName: name,
  cpuUsagePercent: 0,
  ramUsedGb: 0,
  ramTotalGb: undefined,
  status: 'disconnected',
  lastUpdatedAt: undefined,
  statusMessage: reason,
});

const fetchServerMetrics = async (): Promise<ServerMetricViewModel[]> => {
  const results = await Promise.all(
    MONITORED_SERVERS.map(async (server) => {
      try {
        const metrics = await MetricsService.fetchByServer(server.id);
        return adaptServerMetric(server, Array.isArray(metrics) ? metrics : []);
      } catch (error) {
        return buildDisconnected(server.id, server.name, 'Error consultando la API');
      }
    }),
  );

  return results;
};

export const useServerMetrics = () =>
  useQuery({
    queryKey: ['server-metrics'],
    queryFn: fetchServerMetrics,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
