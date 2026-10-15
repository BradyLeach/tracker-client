/**
 * Connection Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export interface Connection
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    /** A configured connector's name. Fixed once created. */
    connectorName: string;
    label?: string;
    /** The source this connection writes into — set by the server. */
    measurementSourceId?: string;
    /** Non-secret connector settings. */
    settings: Record<string, unknown>;
    isActive: boolean;
    pullIntervalMinutes: number;
    /** The end of the last successful pull's window. */
    pulledThrough?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ConnectionTestResult
{
    ok: boolean;
    message?: string;
}

/** What a configured connector produces. Endpoint: GET system/connectors */
export interface ConnectorDeclaration
{
    sourceType: 'event' | 'bucket';
    bucketSize?: 'hour' | 'day';
    allowedMeasurementNames: string[];
    allowedDimensionKeys: string[];
    maxHistoryDays: number;
    requiresCredentials: boolean;
}

export interface ConnectorDescriptor
{
    name: string;
    declaration: ConnectorDeclaration;
}
