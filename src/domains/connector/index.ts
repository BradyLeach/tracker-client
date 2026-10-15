/**
 * Connector Domain — Public API
 *
 * Stable import surface for all connector sub-domains.
 * Import from here, never from internal paths.
 */

// Connection
export type {
    Connection,
    ConnectionTestResult,
    ConnectorDeclaration,
    ConnectorDescriptor
} from './connection';
export {
    connectionService,
    useConnections,
    useConnection,
    useCreateConnection,
    useUpdateConnection,
    useDeleteConnection,
    useTestConnection,
    usePullConnection,
    useConnectorCatalog
} from './connection';

// ConnectorRun
export type {
    ConnectorRun,
    ConnectorRunStatus,
    ConnectorRunKind
} from './connectorRun';
export {
    connectorRunService,
    useConnectorRuns,
    useConnectorRun,
    useConnectorRunsByConnection
} from './connectorRun';
