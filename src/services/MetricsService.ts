import { API_BASE_URL } from '../config/env';
import type { MetricDto } from '../domain/models';
import { ApiClient } from './ApiClient';

class MetricsServiceSingleton {
  private readonly client = ApiClient.getInstance(API_BASE_URL);

  async fetchByServer(serverId: string, signal?: AbortSignal): Promise<MetricDto[]> {
    return this.client.get<MetricDto[]>(`/metrics/${serverId}`, { signal });
  }
}

export const MetricsService = new MetricsServiceSingleton();
