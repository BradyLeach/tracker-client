/**
 * useCreateAddress
 *
 * Creates an address. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { addressService } from '../services/address.service';
import type { Address } from '../types/address.types';

export function useCreateAddress()
{
    return useDataMutation<Address, Partial<Address>>( async ( data ) =>
    {
        const response = await addressService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
