/**
 * useDeleteLocation
 *
 * Hard-deletes a location. The server resolves cascading dependants and returns the full
 * consequence set; the domain store removes every record it names.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { locationService } from '../services/location.service';
import type { DeleteRestoreResult } from '@/services/domain/createDomainStore';

const EMPTY_RESULT: DeleteRestoreResult = { records: { primary: [], related: [] } };

export function useDeleteLocation()
{
    return useDataMutation<DeleteRestoreResult, string>( async ( id ) =>
    {
        const response = await locationService.delete( id );

        if( response.error ) throw response.error;

        return response.data ?? EMPTY_RESULT;
    } );
}
