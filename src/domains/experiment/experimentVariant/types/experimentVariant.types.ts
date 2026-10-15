/**
 * Experiment Variant Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

import type { DimensionFilter } from '@/domains/metric';

/** Which measurements of one source count toward a variant. */
export interface AttributionEntry
{
    measurementSourceId: string;
    filters: DimensionFilter[];
}

export interface ExperimentVariant
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    experimentId: string;
    label: string;
    /** Exactly one per experiment. */
    isControl: boolean;
    attribution: AttributionEntry[];
    createdAt?: string;
    updatedAt?: string;
}
