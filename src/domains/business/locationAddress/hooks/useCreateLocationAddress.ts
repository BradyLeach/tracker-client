/**
 * useCreateLocationAddress
 *
 * Links an address to a location under an address type. The response is shredded into
 * the store, so every subscriber re-emits on its own.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { locationAddressService } from '../services/locationAddress.service';
import type { LocationAddress } from '../types/locationAddress.types';

export function useCreateLocationAddress()
{
    return useDataMutation<LocationAddress, Partial<LocationAddress>>( async ( data ) =>
    {
        const response = await locationAddressService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
