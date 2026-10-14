/**
 * useUpdateAddress
 *
 * The response is shredded into the store, so every subscriber re-emits on its own.
 * There is nothing to invalidate.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { accountService } from '../services/account.service';
import type { Address } from '../types/account.types';

export function useUpdateAddress()
{
    return useDataMutation<Address, { id: string; data: Partial<Address> }>( async ( { id, data } ) =>
    {
        const response = await accountService.updateAddress( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
