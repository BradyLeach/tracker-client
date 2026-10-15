/**
 * Ingest Key Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export type IngestKeyType = 'public' | 'secret';

export interface IngestKey
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    label: string;
    /** Fixed once created. */
    keyType: IngestKeyType;
    /** The first characters of the key, for recognising it. */
    keyPrefix: string;
    /** Public keys only: the event names it may push. */
    permittedMeasurementNames?: string[];
    revokedAt?: string;
    /** The key itself — present only on the create response, never again. */
    key?: string;
    createdAt?: string;
    updatedAt?: string;
}
