import { useQuery } from '@tanstack/react-query';
import { REFRESH_INTERVAL_MS } from '../../../config/env';
import { fetchServerHealthMetrics } from '../api/fetchServerMetrics';

export const useServerHealthMetrics = () =>
  useQuery({
    queryKey: ['server-health', 'metrics'],
    queryFn: ({ signal }) => fetchServerHealthMetrics(signal),
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
