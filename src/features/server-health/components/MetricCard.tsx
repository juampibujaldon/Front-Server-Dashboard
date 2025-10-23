import clsx from 'clsx';

type MetricKind = 'cpu' | 'ram' | 'disk' | 'temperature';

const THRESHOLDS: Record<MetricKind, { warning: number; critical: number; unit: string }> = {
  cpu: { warning: 70, critical: 90, unit: '%' },
  ram: { warning: 75, critical: 90, unit: '%' },
  disk: { warning: 80, critical: 95, unit: '%' },
  temperature: { warning: 65, critical: 75, unit: '°C' },
};

const LABELS: Record<MetricKind, string> = {
  cpu: 'Uso de CPU',
  ram: 'Uso de RAM',
  disk: 'Uso de Disco',
  temperature: 'Temperatura',
};

const ICONS: Record<MetricKind, string> = {
  cpu: '🧠',
  ram: '💾',
  disk: '🗄️',
  temperature: '🌡️',
};

type MetricCardProps = {
  kind: MetricKind;
  value: number;
};

const getStatus = (kind: MetricKind, value: number) => {
  const { warning, critical } = THRESHOLDS[kind];
  if (value >= critical) return 'critical';
  if (value >= warning) return 'warning';
  return 'healthy';
};

const STATUS_STYLES: Record<string, { text: string; badge: string; ring: string }> = {
  healthy: {
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    ring: 'ring-emerald-500/20',
  },
  warning: {
    text: 'text-amber-500',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/40',
    ring: 'ring-amber-500/25',
  },
  critical: {
    text: 'text-rose-500',
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/40',
    ring: 'ring-rose-500/25',
  },
};

const formatValue = (value: number, unit: string) => {
  if (Number.isNaN(value)) return `0${unit}`;
  const formatted = value >= 100 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted}${unit}`;
};

export const MetricCard = ({ kind, value }: MetricCardProps) => {
  const status = getStatus(kind, value);
  const styles = STATUS_STYLES[status];
  const thresholds = THRESHOLDS[kind];

  return (
    <article
      className={clsx(
        'group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm backdrop-blur transition-colors dark:border-slate-800/60 dark:bg-slate-900/70',
        'after:pointer-events-none after:absolute after:-inset-1 after:bg-gradient-to-br after:from-brand-600/0 after:via-brand-600/5 after:to-brand-600/10 after:opacity-0 after:transition after:duration-500 group-hover:after:opacity-100',
        'dark:shadow-[0px_12px_40px_rgba(15,118,227,0.12)]',
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{LABELS[kind]}</p>
          <p className={clsx('mt-3 text-3xl font-semibold tracking-tight', styles.text)}>
            {formatValue(value, thresholds.unit)}
          </p>
        </div>
        <div
          className={clsx(
            'flex h-12 w-12 items-center justify-center rounded-2xl border text-2xl transition-all',
            styles.badge,
            styles.ring,
          )}
        >
          <span aria-hidden>{ICONS[kind]}</span>
        </div>
      </div>
      <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Umbral alerta&nbsp;
          <strong>{formatValue(thresholds.warning, thresholds.unit)}</strong>
        </span>
        <span>
          Crítico&nbsp;
          <strong>{formatValue(thresholds.critical, thresholds.unit)}</strong>
        </span>
      </div>
    </article>
  );
};
