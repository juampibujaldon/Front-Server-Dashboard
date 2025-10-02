import { useMemo } from 'react';
import { ServerGrid } from '../components/ServerCard/ServerGrid';
import { EmptyState } from '../components/ServerCard/EmptyState';
import { PageHeader } from '../components/ServerCard/PageHeader';
import { useServerMetrics } from '../hooks/useServerMetrics';

function App() {
  const { data, isLoading, isError, refetch, isFetching } = useServerMetrics();

  const showEmptyState = useMemo(
    () => !isLoading && !isError && (data?.length ?? 0) === 0,
    [data, isError, isLoading],
  );

  return (
    <div className="app-shell">
      <PageHeader onRefresh={() => { void refetch(); }} isRefreshing={isFetching} />

      {isError && (
        <EmptyState
          title="No pudimos obtener las métricas"
          description="Revisa que el backend esté en ejecución y responde en el endpoint /api/metrics"
          actionLabel="Reintentar"
          onAction={() => { void refetch(); }}
        />
      )}

      {isLoading && !isError && (
        <EmptyState
          title="Cargando métricas"
          description="Buscando la información de los agentes"
        />
      )}

      {showEmptyState && (
        <EmptyState
          title="Sin servidores monitoreados"
          description="Aún no se registraron métricas para los servidores configurados"
        />
      )}

      {!showEmptyState && !isError && <ServerGrid servers={data ?? []} />}
    </div>
  );
}

export default App;
