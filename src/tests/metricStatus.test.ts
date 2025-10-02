import { describe, expect, it } from 'vitest';
import { resolveStatus } from '../domain/strategies/metricStatus';

describe('resolveStatus strategy', () => {
  it('detecta desconexión cuando no hay datos', () => {
    const result = resolveStatus({
      hasData: false,
      isStale: false,
      cpuUsagePercent: 0,
      ramUsageRatio: null,
    });

    expect(result.status).toBe('disconnected');
  });

  it('detecta sobrecarga cuando la RAM supera el umbral', () => {
    const result = resolveStatus({
      hasData: true,
      isStale: false,
      cpuUsagePercent: 20,
      ramUsageRatio: 0.95,
    });

    expect(result.status).toBe('overloaded');
  });

  it('devuelve activo en condiciones normales', () => {
    const result = resolveStatus({
      hasData: true,
      isStale: false,
      cpuUsagePercent: 40,
      ramUsageRatio: 0.4,
    });

    expect(result.status).toBe('active');
  });
});
