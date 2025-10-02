export type MetricStatus = 'active' | 'overloaded' | 'disconnected';

export interface MetricDto {
  id?: string;
  serverId: string;
  cpu_usage: number;
  ram_usage: number;
  disk_space?: number;
  temperature?: number;
  created_at?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface ServerConfig {
  id: string;
  name: string;
  totalRamGb?: number;
}

export interface ServerMetricViewModel {
  serverId: string;
  serverName: string;
  cpuUsagePercent: number;
  ramUsedGb: number;
  ramTotalGb?: number;
  status: MetricStatus;
  lastUpdatedAt?: string;
  statusMessage?: string;
}

