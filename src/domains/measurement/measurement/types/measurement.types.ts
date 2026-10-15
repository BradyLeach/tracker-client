/**
 * Measurement Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export interface Measurement
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    measurementSourceId: string;
    name: string;
    /** UTC. Bucket sources store the bucket start. */
    occurredAt: string;
    /** Whole number: 1 for an event, the total for a bucket. */
    value: number;
    /** Flat map of dimension key to value. */
    dimensions: Record<string, string>;
    /** Present only when the source supplied one. */
    campaignKey?: string;
    idempotencyKey?: string;
    createdAt?: string;
    updatedAt?: string;
}

/** One measurement as sent to ingest. */
export interface IngestMeasurement
{
    name: string;
    occurredAt: string;
    value?: number;
    dimensions?: Record<string, string>;
    campaignKey?: string;
    /** The source's own id for the measurement; re-sending it updates rather than duplicates. */
    externalId?: string;
}

/** Endpoint: POST measurement/measurements/ingest */
export interface IngestPayload
{
    measurementSourceId: string;
    measurements: IngestMeasurement[];
}
