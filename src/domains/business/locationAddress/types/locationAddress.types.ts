/**
 * LocationAddress Types
 *
 * The relationship between a location and an address, classified by address type. A
 * location holds many, one per purpose (dispatch, front office, ...). Hydrated
 * relationships are optional — they are present only after a read that included them.
 */

import type { SystemType } from '@/domains/system/types/systemType.types';
import type { Address } from '../../address/types/address.types';

export interface LocationAddress
{
    id: string;
    ownerId: string;
    locationId: string;
    addressId: string;
    addressTypeId: string;
    createdAt?: string;
    updatedAt?: string;

    // Hydrated relationships
    address?: Address;
    addressType?: SystemType;
}
