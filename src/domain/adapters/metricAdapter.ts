import { METRIC_STALE_THRESHOLD_MS } from '../../config/env';
import type { MetricDto, ServerConfig, ServerMetricViewModel } from '../models';
import { resolveStatus } from '../strategies/metricStatus';

const toDate = (input?: string): Date | null => {
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getLatestMetric = (metrics: MetricDto[]): MetricDto | null => {
  if (metrics.length === 0) return null;
  return metrics[metrics.length - 1];
};

const calculateRamUsage = (metric: MetricDto | null, totalRamGb?: number) => {
  if (!metric) {
    return { usedGb: 0, ratio: null as number | null };
  }

  const raw = Number(metric.ram_usage);
  if (!Number.isFinite(raw)) {
    return { usedGb: 0, ratio: null };
  }

  if (!totalRamGb || totalRamGb <= 0) {
    // Interpret the payload as already in GB
    return { usedGb: raw, ratio: null };
  }

  // Interpret the payload as percentage when total is known
  const ratio = raw > 1 ? raw / 100 : raw;
  return {
    usedGb: Number((totalRamGb * ratio).toFixed(2)),
    ratio,
  };
};

export const adaptServerMetric = (
  config: ServerConfig,
  metrics: MetricDto[],
): ServerMetricViewModel => {
  const latestMetric = getLatestMetric(metrics);

  const lastUpdatedAt = toDate(latestMetric?.created_at ?? latestMetric?.createdAt ?? latestMetric?.timestamp);
  const now = new Date();
  const isStale = lastUpdatedAt ? now.getTime() - lastUpdatedAt.getTime() > METRIC_STALE_THRESHOLD_MS : false;
  const hasData = Boolean(latestMetric);

  const cpuUsagePercent = latestMetric ? Number(latestMetric.cpu_usage) : 0;

  const { usedGb, ratio } = calculateRamUsage(latestMetric, config.totalRamGb);

  const { status, reason } = resolveStatus({
    hasData,
    isStale,
    cpuUsagePercent,
    ramUsageRatio: ratio,
  });

  return {
    serverId: config.id,
    serverName: config.name,
    cpuUsagePercent,
    ramUsedGb: Number(usedGb.toFixed(2)),
    ramTotalGb: config.totalRamGb,
    status,
    lastUpdatedAt: lastUpdatedAt?.toISOString(),
    statusMessage: reason,
  };
};

