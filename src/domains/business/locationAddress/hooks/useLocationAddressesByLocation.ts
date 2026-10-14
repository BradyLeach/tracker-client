/**
 * useLocationAddressesByLocation
 *
 * All address relationships belonging to one location, read from the store.
 * Stays idle until a locationId is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { locationAddressService } from '../services/locationAddress.service';
import type { LocationAddress } from '../types/locationAddress.types';

export function useLocationAddressesByLocation( locationId: string | undefined )
{
    return useDataQuery<LocationAddress[]>(
        () => locationId ? locationAddressService.observeByLocation( locationId ) : undefined,
        [locationId],
    );
}
