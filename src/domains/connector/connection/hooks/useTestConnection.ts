import { useDataMutation } from '@/services/domain/useDataQuery';
import { connectionService } from '../services/connection.service';
import type { ConnectionTestResult } from '../types/connection.types';

/**
 * Checks a connection's settings reach its source. Nothing is stored.
 */
export function useTestConnection()
{
    return useDataMutation<ConnectionTestResult, string>( async ( id ) =>
    {
        const response = await connectionService.testConnection( id );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
