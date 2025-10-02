import clsx from 'clsx';
import type { ServerMetricViewModel } from '../../domain/models';
import { MetricWidgetFactory } from '../../domain/factories/MetricWidgetFactory';
import { formatDateTime } from '../../utils/format';
import styles from './ServerCard.module.css';

interface Props {
  metric: ServerMetricViewModel;
}

const statusLabels: Record<ServerMetricViewModel['status'], string> = {
  active: 'Operativo',
  overloaded: 'Sobrecargado',
  disconnected: 'Desconectado',
};

export const ServerCard = ({ metric }: Props) => {
  const cpuWidget = MetricWidgetFactory.create('cpu', {
    value: metric.cpuUsagePercent,
  });
  const ramWidget = MetricWidgetFactory.create('ram', {
    value: metric.ramUsedGb,
    total: metric.ramTotalGb,
  });

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.name}>{metric.serverName}</h2>
          <p className={styles.meta}>Última actualización: {formatDateTime(metric.lastUpdatedAt)}</p>
        </div>
        <span
          className={clsx(styles.statusBadge, {
            [styles.statusActive]: metric.status === 'active',
            [styles.statusOverloaded]: metric.status === 'overloaded',
            [styles.statusDisconnected]: metric.status === 'disconnected',
          })}
        >
          {statusLabels[metric.status]}
        </span>
      </header>

      <div className={styles.widgets}>
        {cpuWidget.render()}
        {ramWidget.render()}
      </div>

      {metric.statusMessage && (
        <footer className={styles.footer}>{metric.statusMessage}</footer>
      )}
    </article>
  );
};
