/**
 * useDeleteLocationAddress
 *
 * Hard-deletes a location–address relationship, removing the address from the location.
 * The address record itself is left in place. The domain store removes every record the
 * server names in the consequence set.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { locationAddressService } from '../services/locationAddress.service';
import type { DeleteRestoreResult } from '@/services/domain/createDomainStore';

const EMPTY_RESULT: DeleteRestoreResult = { records: { primary: [], related: [] } };

export function useDeleteLocationAddress()
{
    return useDataMutation<DeleteRestoreResult, string>( async ( id ) =>
    {
        const response = await locationAddressService.delete( id );

        if( response.error ) throw response.error;

        return response.data ?? EMPTY_RESULT;
    } );
}
