/**
 * useUpdateIdentity
 *
 * The response is shredded into the store, so every subscriber re-emits on its own —
 * the navbar name included. There is nothing to invalidate.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { identityService } from '../services/identity.service';
import type { Identity } from '../types/identity.types';

export function useUpdateIdentity()
{
    return useDataMutation<Identity, { id: string; data: Partial<Identity> }>( async ( { id, data } ) =>
    {
        const response = await identityService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
