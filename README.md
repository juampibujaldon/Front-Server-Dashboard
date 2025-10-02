# Front Server Dashboard

Dashboard minimalista para visualizar la carga de los servidores monitorizados por el agente Rust y el backend Flask.

## Características
- Visualización de CPU en porcentaje y RAM como `X GB / Y GB`.
- Actualización automática cada 15 segundos (configurable mediante variables de entorno).
- Etiquetado de estado (Operativo, Sobrecargado, Desconectado) según estrategias de negocio.
- Diseño responsivo, limpio y centrado en la información relevante.

## Instalación
```bash
npm install
# opcional: copiar el archivo de variables
cp .env.example .env
```

Configura `VITE_API_BASE_URL` para apuntar al backend Flask (por defecto `http://localhost:5000/api`).

## Scripts disponibles
- `npm run dev` → inicia el servidor de desarrollo.
- `npm run build` → genera la build de producción.
- `npm run preview` → levanta la build generada para verificación manual.
- `npm test` → ejecuta la suite de pruebas unitarias con Vitest.

## Arquitectura y patrones
- **Singleton**: `ApiClient` garantiza un único punto de acceso HTTP reutilizable.
- **Factory Method**: `MetricWidgetFactory` encapsula la creación de widgets de CPU y RAM.
- **Strategy**: `resolveStatus` selecciona la estrategia adecuada para evaluar el estado de cada servidor.
- **TDD**: las piezas clave (adapter, estrategias, singleton y fábrica) cuentan con pruebas unitarias.
- **Principios SOLID / KISS / DRY**: separación clara entre capa de servicios, dominio, componentes y utilidades.

## Configuración de servidores monitoreados
Los servidores visibles se definen en `src/config/servers.ts`. Cada entrada permite indicar:
```ts
{ id: 'server-01', name: 'Servidor Principal', totalRamGb: 16 }
```
`totalRamGb` es opcional, pero habilita el cálculo `X GB / Y GB`.

## Flujo de datos
1. `useServerMetrics` consulta las métricas de cada servidor mediante `MetricsService`.
2. `adaptServerMetric` transforma los datos crudos y aplica la lógica de negocio.
3. Los componentes de UI renderizan tarjetas y widgets, manteniendo el diseño desacoplado de la lógica.

## Próximos pasos sugeridos
- Conectar la lista de servidores a un endpoint dinámico cuando el backend lo exponga.
- Agregar gráficos históricos utilizando el mismo `ApiClient` si se exponen series temporales.
- Incorporar pruebas end-to-end con Playwright para validar el flujo completo.
