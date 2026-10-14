/**
 * useLocationAddressesByLocations
 *
 * All address relationships belonging to a set of locations, read from the store.
 * Stays idle until at least one locationId is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { locationAddressService } from '../services/locationAddress.service';
import type { LocationAddress } from '../types/locationAddress.types';

export function useLocationAddressesByLocations( locationIds: string[] )
{
    const key = locationIds.join( ',' );

    return useDataQuery<LocationAddress[]>(
        () => locationIds.length ? locationAddressService.observeByLocations( locationIds ) : undefined,
        [key],
    );
}
