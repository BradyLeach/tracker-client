/**
 * useUpdateLocationAddress
 *
 * Reclassifies a relationship or points it at a new address version. The address itself
 * is never edited in place. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { locationAddressService } from '../services/locationAddress.service';
import type { LocationAddress } from '../types/locationAddress.types';

export function useUpdateLocationAddress( id: string )
{
    return useDataMutation<LocationAddress, Partial<LocationAddress>>( async ( data ) =>
    {
        const response = await locationAddressService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
