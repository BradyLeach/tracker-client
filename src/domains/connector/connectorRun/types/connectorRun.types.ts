/**
 * Connector Run Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export type ConnectorRunStatus = 'running' | 'succeeded' | 'failed';

export type ConnectorRunKind = 'backfill' | 'scheduled' | 'manual';

export interface ConnectorRun
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    connectionId: string;
    kind: ConnectorRunKind;
    status: ConnectorRunStatus;
    windowStart: string;
    windowEnd: string;
    measurementCount?: number;
    errorMessage?: string;
    startedAt: string;
    finishedAt?: string;
}
