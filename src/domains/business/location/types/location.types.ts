/**
 * Location Types
 *
 * The Location interface mirrors the backend model definition. Hydrated relationships
 * are optional — they are present only after a read that included them.
 */

import type { SystemType } from '@/domains/system/types/systemType.types';

export interface Location
{
    id: string;
    ownerId: string;
    companyId: string;
    locationTypeId: string;
    label?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;

    // Hydrated relationships
    locationType?: SystemType;
}
