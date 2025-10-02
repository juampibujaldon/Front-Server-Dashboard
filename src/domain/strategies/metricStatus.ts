import type { MetricStatus } from '../models';

export interface StatusEvaluation {
  status: MetricStatus;
  reason?: string;
}

export interface StatusPayload {
  hasData: boolean;
  isStale: boolean;
  cpuUsagePercent: number;
  ramUsageRatio?: number | null;
}

interface MetricStatusStrategy {
  matches(payload: StatusPayload): boolean;
  evaluate(payload: StatusPayload): StatusEvaluation;
}

class DisconnectedStrategy implements MetricStatusStrategy {
  matches(payload: StatusPayload): boolean {
    return !payload.hasData || payload.isStale;
  }

  evaluate(payload: StatusPayload): StatusEvaluation {
    return {
      status: 'disconnected',
      reason: payload.hasData ? 'Sin datos recientes' : 'Sin datos disponibles',
    };
  }
}

class OverloadedStrategy implements MetricStatusStrategy {
  matches(payload: StatusPayload): boolean {
    const ramRatio = payload.ramUsageRatio ?? 0;
    return payload.cpuUsagePercent >= 85 || ramRatio >= 0.9;
  }

  evaluate(): StatusEvaluation {
    return {
      status: 'overloaded',
      reason: 'Carga elevada detectada',
    };
  }
}

class NominalStrategy implements MetricStatusStrategy {
  matches(): boolean {
    return true;
  }

  evaluate(): StatusEvaluation {
    return {
      status: 'active',
    };
  }
}

const strategies: MetricStatusStrategy[] = [
  new DisconnectedStrategy(),
  new OverloadedStrategy(),
  new NominalStrategy(),
];

export const resolveStatus = (payload: StatusPayload): StatusEvaluation => {
  const strategy = strategies.find((candidate) => candidate.matches(payload));
  if (!strategy) {
    return { status: 'active' };
  }
  return strategy.evaluate(payload);
};
