import { useDataMutation } from '@/services/domain/useDataQuery';
import { connectionService } from '../services/connection.service';
import type { Connection } from '../types/connection.types';

export function useUpdateConnection( id: string )
{
    return useDataMutation<Connection, Partial<Connection>>( async ( data ) =>
    {
        const response = await connectionService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
