import { useDataMutation } from '@/services/domain/useDataQuery';
import { connectionService } from '../services/connection.service';
import type { Connection } from '../types/connection.types';

/**
 * Creates a connection. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateConnection()
{
    return useDataMutation<Connection, Partial<Connection>>( async ( data ) =>
    {
        const response = await connectionService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
