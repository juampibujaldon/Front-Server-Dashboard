import type { ServerConfig } from '../domain/models';

export const MONITORED_SERVERS: ServerConfig[] = [
  { id: 'server-01', name: 'Servidor Principal', totalRamGb: 16 },
  { id: 'server-02', name: 'Balanceador', totalRamGb: 8 },
  { id: 'server-03', name: 'DB Replica', totalRamGb: 32 },
];
