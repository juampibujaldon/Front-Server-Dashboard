import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ServerMetricPoint } from '../types';

type MetricTrendChartProps = {
  history: ServerMetricPoint[];
  isLoading: boolean;
};

type SeriesConfig = {
  key: keyof Pick<ServerMetricPoint, 'cpu_usage' | 'ram_usage' | 'disk_space' | 'temperature'>;
  label: string;
  unit: string;
  gradientId: string;
  stroke: string;
};

const SERIES: SeriesConfig[] = [
  {
    key: 'cpu_usage',
    label: 'CPU',
    unit: '%',
    gradientId: 'gradientCpu',
    stroke: '#0ea5e9',
  },
  {
    key: 'ram_usage',
    label: 'RAM',
    unit: '%',
    gradientId: 'gradientRam',
    stroke: '#22d3ee',
  },
  {
    key: 'disk_space',
    label: 'Disco',
    unit: '%',
    gradientId: 'gradientDisk',
    stroke: '#38bdf8',
  },
  {
    key: 'temperature',
    label: 'Temperatura',
    unit: '°C',
    gradientId: 'gradientTemp',
    stroke: '#f97316',
  },
];

const buildSeriesData = (history: ServerMetricPoint[]) =>
  history
    .slice()
    .sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt))
    .map((point, index) => ({
      muestra: index + 1,
      cpu_usage: Number(point.cpu_usage ?? 0),
      ram_usage: Number(point.ram_usage ?? 0),
      disk_space: Number(point.disk_space ?? 0),
      temperature: Number(point.temperature ?? 0),
    }));

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

  const data = buildSeriesData(history);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {SERIES.map((series) => (
        <div
          key={series.key}
          className="h-80 w-full rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70"
        >
          <header className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span>{series.label}</span>
            <span className="rounded-full bg-slate-200/50 px-2 py-0.5 text-[0.65rem] text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              refresco 30s
            </span>
          </header>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 8 }}>
              <defs>
                <linearGradient id={series.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={series.stroke} stopOpacity={0.55} />
                  <stop offset="95%" stopColor={series.stroke} stopOpacity={0.05} />
                </linearGradient>
              </defs>
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
                formatter={(value: number) => formatValue(value, series.unit)}
                labelFormatter={(value: number) => `Muestra ${value}`}
              />
              <Area
                type="monotone"
                dataKey={series.key}
                stroke={series.stroke}
                fill={`url(#${series.gradientId})`}
                strokeWidth={2.2}
                dot={data.length <= 1}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};
