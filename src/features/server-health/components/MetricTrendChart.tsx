import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ServerMetricPoint } from '../types';

type MetricTrendChartProps = {
  data: ServerMetricPoint[];
  isLoading: boolean;
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
};

const formatYAxis = (value: number) => `${value.toFixed(0)}%`;

const buildChartData = (points: ServerMetricPoint[]) =>
  points
    .slice()
    .sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt))
    .map((point) => ({
      time: formatTime(point.observedAt),
      cpu: Number(point.cpu_usage ?? 0),
      ram: Number(point.ram_usage ?? 0),
      temperature: Number(point.temperature ?? 0),
    }));

export const MetricTrendChart = ({ data, isLoading }: MetricTrendChartProps) => {
  if (isLoading) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-slate-200/60 bg-white/70 dark:border-slate-800/60 dark:bg-slate-900/60">
        <p className="text-sm text-slate-500 dark:text-slate-400">Cargando histórico de métricas…</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aún no hay suficiente historial para graficar. Mantén el agente enviando métricas.
        </p>
      </div>
    );
  }

  const chartData = buildChartData(data);
  const shouldShowDots = chartData.length <= 1;

  return (
    <div className="h-80 w-full rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 16, bottom: 8 }}>
          <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.65} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.65} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity={0.65} />
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis dataKey="time" stroke="currentColor" fontSize={12} />
          <YAxis stroke="currentColor" fontSize={12} tickFormatter={formatYAxis} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15,23,42,0.92)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(148,163,184,0.2)',
              color: 'white',
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number, name) => {
              const label = translateSeriesName(name);
              const suffix = label.includes('Temperatura') ? '°C' : '%';
              return [`${Number(value).toFixed(1)}${suffix}`, label];
            }}
          />
          <Legend
            formatter={(value) => translateSeriesName(value)}
            wrapperStyle={{ paddingTop: 12 }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="cpu"
            name="cpu"
            stroke="#0ea5e9"
            fill="url(#cpuGradient)"
            strokeWidth={2.5}
            dot={shouldShowDots}
          />
          <Area
            type="monotone"
            dataKey="ram"
            name="ram"
            stroke="#22d3ee"
            fill="url(#ramGradient)"
            strokeWidth={2.5}
            dot={shouldShowDots}
          />
          <Area
            type="monotone"
            dataKey="temperature"
            name="temperature"
            stroke="#f43f5e"
            fill="url(#tempGradient)"
            strokeWidth={2.5}
            dot={shouldShowDots}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const translateSeriesName = (name: string | number) => {
  const label = typeof name === 'string' ? name : String(name);

  switch (label) {
    case 'cpu':
      return 'CPU (%)';
    case 'ram':
      return 'RAM (%)';
    case 'temperature':
      return 'Temperatura (°C)';
    default:
      return label;
  }
};
