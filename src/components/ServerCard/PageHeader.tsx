import { REFRESH_INTERVAL_MS } from '../../config/env';
import styles from './PageHeader.module.css';

interface Props {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const seconds = Math.round(REFRESH_INTERVAL_MS / 1000);

export const PageHeader = ({ onRefresh, isRefreshing }: Props) => (
  <header className={styles.header}>
    <div>
      <h1 className={styles.title}>Server Dashboard</h1>
      <p className={styles.subtitle}>Actualización automática cada {seconds} segundos.</p>
    </div>
    <button className={styles.refreshButton} onClick={onRefresh} disabled={isRefreshing}>
      {isRefreshing ? 'Actualizando…' : 'Actualizar'}
    </button>
  </header>
);
