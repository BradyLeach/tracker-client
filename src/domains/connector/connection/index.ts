/**
 * Connection Sub-Domain — Public API
 *
 * Stable import surface for the connection sub-domain.
 * Import from here, never from internal paths.
 */

export type { Connection, ConnectionTestResult, ConnectorDeclaration, ConnectorDescriptor } from './types/connection.types';
export { connectionService } from './services/connection.service';
export { useConnections } from './hooks/useConnections';
export { useConnection } from './hooks/useConnection';
export { useCreateConnection } from './hooks/useCreateConnection';
export { useUpdateConnection } from './hooks/useUpdateConnection';
export { useDeleteConnection } from './hooks/useDeleteConnection';
export { useTestConnection } from './hooks/useTestConnection';
export { usePullConnection } from './hooks/usePullConnection';
export { useConnectorCatalog } from './hooks/useConnectorCatalog';
