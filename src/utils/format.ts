export const formatPercentage = (value: number) => `${Math.round(value)}%`;

export const formatRamUsage = (used: number, total?: number) => {
  const usedLabel = `${used.toFixed(1)} GB`;
  if (!total || total <= 0) {
    return usedLabel;
  }
  return `${usedLabel} / ${total.toFixed(1)} GB`;
};

export const formatDateTime = (isoDate?: string) => {
  if (!isoDate) return 'Sin registros';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return 'Sin registros';
  }
  return date.toLocaleString();
};
