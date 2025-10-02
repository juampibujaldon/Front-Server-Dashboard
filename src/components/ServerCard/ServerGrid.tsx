import type { ServerMetricViewModel } from '../../domain/models';
import { ServerCard } from './ServerCard';
import styles from './ServerGrid.module.css';

interface Props {
  servers: ServerMetricViewModel[];
}

export const ServerGrid = ({ servers }: Props) => (
  <section className={styles.grid}>
    {servers.map((server) => (
      <ServerCard key={server.serverId} metric={server} />
    ))}
  </section>
);
