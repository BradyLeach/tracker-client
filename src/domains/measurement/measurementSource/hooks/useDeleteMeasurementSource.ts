/**
 * useDeleteMeasurementSource
 *
 * Hard-deletes a measurement source. The server resolves cascading dependants and returns the full
 * consequence set; the domain store removes every record it names.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { measurementSourceService } from '../services/measurementSource.service';
import type { DeleteRestoreResult } from '@/services/domain/createDomainStore';

const EMPTY_RESULT: DeleteRestoreResult = { records: { primary: [], related: [] } };

export function useDeleteMeasurementSource()
{
    return useDataMutation<DeleteRestoreResult, string>( async ( id ) =>
    {
        const response = await measurementSourceService.delete( id );

        if( response.error ) throw response.error;

        return response.data ?? EMPTY_RESULT;
    } );
}
