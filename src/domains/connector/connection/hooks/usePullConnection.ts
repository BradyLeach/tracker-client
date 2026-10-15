import { useDataMutation } from '@/services/domain/useDataQuery';
import { connectionService } from '../services/connection.service';
import type { ConnectorRun } from '../../connectorRun/types/connectorRun.types';

/**
 * Pulls a connection now. The finished run is stored as returned.
 */
export function usePullConnection()
{
    return useDataMutation<ConnectorRun, string>( async ( id ) =>
    {
        const response = await connectionService.pullNow( id );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
