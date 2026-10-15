/**
 * Measurement Source Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

/** How a source delivers measurements: one per event, or one per bucket. */
export type MeasurementSourceType = 'event' | 'bucket';

/** Bucket size of a bucket source. */
export type BucketSize = 'hour' | 'day';

export interface MeasurementSource
{
    /** Primary key — read only. */
    id: string;
    /** Foreign key to account. Set on create, never updated. */
    ownerId: string;
    /** Stable key, unique per account: 'push', 'manual', or a connector name. Fixed once created. */
    key: string;
    label?: string;
    /** Fixed once created. */
    sourceType: MeasurementSourceType;
    /** Bucket sources only. Fixed once created. */
    bucketSize?: BucketSize;
    /** Measurement names this source may write. */
    allowedMeasurementNames: string[];
    /** Dimension keys this source may write, and that filters may reference. */
    allowedDimensionKeys: string[];
    createdAt?: string;
    updatedAt?: string;
}
