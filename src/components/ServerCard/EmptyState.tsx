import styles from './EmptyState.module.css';

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: Props) => (
  <div className={styles.wrapper}>
    <h2 className={styles.title}>{title}</h2>
    {description && <p className={styles.description}>{description}</p>}
    {actionLabel && onAction && (
      <button className={styles.button} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);
