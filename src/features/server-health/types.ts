export interface ServerMetric {
  id: string;
  server_id: string;
  cpu_usage: number;
  ram_usage: number;
  disk_space: number;
  temperature: number;
  created_at?: string;
  updated_at?: string;
  collected_at?: string;
  timestamp?: string;
}

export interface ServerMetricPoint extends ServerMetric {
  observedAt: string;
}

export interface ServerHealthSnapshot {
  metrics: ServerMetric[];
  isFallback: boolean;
}
