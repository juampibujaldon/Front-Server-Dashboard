import { useEffect } from 'react';
import { ServerHealthDashboard } from '../features/server-health/components/ServerHealthDashboard';

const syncPreferredScheme = () => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const apply = (event: MediaQueryList | MediaQueryListEvent) => {
    const matches = 'matches' in event ? event.matches : mediaQuery.matches;
    root.classList.toggle('dark', matches);
  };

  apply(mediaQuery);
  mediaQuery.addEventListener('change', apply);

  return () => {
    mediaQuery.removeEventListener('change', apply);
  };
};

function App() {
  useEffect(() => {
    const cleanup = syncPreferredScheme();
    return () => {
      cleanup?.();
    };
  }, []);

  return <ServerHealthDashboard />;
}

export default App;
