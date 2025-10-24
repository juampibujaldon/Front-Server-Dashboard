import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ServerMetricPoint } from '../types';

type MetricTrendChartProps = {
  history: ServerMetricPoint[];
  isLoading: boolean;
};

type SeriesConfig = {
  key: keyof Pick<ServerMetricPoint, 'cpu_usage' | 'ram_usage' | 'disk_space' | 'temperature'>;
  label: string;
  unit: string;
  stroke: string;
  previousStroke: string;
  badge: string;
};

const SERIES: SeriesConfig[] = [
  {
    key: 'cpu_usage',
    label: 'CPU',
    unit: '%',
    stroke: '#0ea5e9',
    previousStroke: 'rgba(14,165,233,0.45)',
    badge: '%',
  },
  {
    key: 'ram_usage',
    label: 'RAM',
    unit: '%',
    stroke: '#22d3ee',
    previousStroke: 'rgba(34,211,238,0.45)',
    badge: '%',
  },
  {
    key: 'disk_space',
    label: 'Disco',
    unit: '%',
    stroke: '#38bdf8',
    previousStroke: 'rgba(56,189,248,0.45)',
    badge: '%',
  },
  {
    key: 'temperature',
    label: 'Temperatura',
    unit: '°C',
    stroke: '#f97316',
    previousStroke: 'rgba(249,115,22,0.45)',
    badge: '°C',
  },
];

const buildSeriesData = (history: ServerMetricPoint[], key: SeriesConfig['key']) =>
  history
    .slice()
    .sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt))
    .map((point, index, arr) => {
      const current = Number(point[key] ?? 0);
      const previous = index > 0 ? Number(arr[index - 1][key] ?? 0) : null;
      return {
        muestra: index + 1,
        actual: current,
        anterior: previous,
        delta: previous === null ? 0 : current - previous,
      };
    });

const formatValue = (value: number, unit: string) => `${Number(value).toFixed(1)}${unit}`;

const ChartSkeleton = ({ label }: { label: string }) => (
  <div className="flex h-80 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200/60 bg-white/70 p-6 text-center dark:border-slate-800/60 dark:bg-slate-900/60">
    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">Esperando lecturas del agente…</p>
  </div>
);

export const MetricTrendChart = ({ history, isLoading }: MetricTrendChartProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {SERIES.map((series) => (
          <ChartSkeleton key={series.key} label={`Cargando ${series.label}…`} />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Necesitamos algunas muestras para graficar. Mantén el agente enviando datos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {SERIES.map((series) => (
        <div
          key={series.key}
          className="relative h-80 w-full rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70"
        >
          <header className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span>{series.label}</span>
            <span className="rounded-full bg-slate-200/50 px-2 py-0.5 text-[0.65rem] text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              refresco 30s
            </span>
          </header>
          <span className="absolute right-6 top-10 text-lg font-semibold text-slate-400 dark:text-slate-500">
            {series.badge}
          </span>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={buildSeriesData(history, series.key)}
              margin={{ left: 10, right: 14, top: 10, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis dataKey="muestra" stroke="currentColor" fontSize={11} tickFormatter={(value) => `M${value}`} />
              <YAxis stroke="currentColor" fontSize={11} tickFormatter={(value) => `${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15,23,42,0.92)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(148,163,184,0.2)',
                  color: 'white',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number, name: string) => {
                  if (name === 'delta') {
                    const diff = Number(value);
                    const sign = diff > 0 ? '+' : '';
                    return [`${sign}${diff.toFixed(1)}${series.unit}`, 'Variación'];
                  }
                  return [formatValue(value, series.unit), name === 'actual' ? 'Actual' : 'Anterior'];
                }}
                labelFormatter={(value: number, payload: any) => {
                  const entry = Array.isArray(payload) && payload[0] ? payload[0].payload : undefined;
                  const delta = entry ? Number(entry.delta ?? 0) : 0;
                  const sign = delta > 0 ? '+' : '';
                  return `Muestra ${value} (${sign}${delta.toFixed(1)}${series.unit} vs anterior)`;
                }}
              />
              <Legend
                formatter={(value) => (value === 'actual' ? 'Actual' : 'Anterior')}
                wrapperStyle={{ paddingTop: 6 }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="anterior"
                name="Anterior"
                stroke={series.previousStroke}
                strokeDasharray="5 6"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke={series.stroke}
                strokeWidth={2.6}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};
