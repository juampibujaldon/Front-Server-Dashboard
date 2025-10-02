import { describe, expect, it } from 'vitest';
import { adaptServerMetric } from '../domain/adapters/metricAdapter';
import type { MetricDto, ServerConfig } from '../domain/models';

describe('adaptServerMetric', () => {
  const config: ServerConfig = { id: 'server-x', name: 'Servidor X', totalRamGb: 16 };

  it('convierte métricas crudas en un view model activo', () => {
    const metrics: MetricDto[] = [
      {
        serverId: 'server-x',
        cpu_usage: 35,
        ram_usage: 50,
        timestamp: new Date().toISOString(),
      },
    ];

    const result = adaptServerMetric(config, metrics);

    expect(result.cpuUsagePercent).toBe(35);
    expect(result.ramUsedGb).toBe(8);
    expect(result.status).toBe('active');
    expect(result.statusMessage).toBeUndefined();
  });

  it('marca el servidor como sobrecargado si la CPU supera el umbral', () => {
    const metrics: MetricDto[] = [
      {
        serverId: 'server-x',
        cpu_usage: 90,
        ram_usage: 20,
        timestamp: new Date().toISOString(),
      },
    ];

    const result = adaptServerMetric(config, metrics);
    expect(result.status).toBe('overloaded');
    expect(result.statusMessage).toBe('Carga elevada detectada');
  });

  it('marca como desconectado cuando no hay datos', () => {
    const result = adaptServerMetric(config, []);

    expect(result.status).toBe('disconnected');
    expect(result.statusMessage).toBe('Sin datos disponibles');
  });
});
