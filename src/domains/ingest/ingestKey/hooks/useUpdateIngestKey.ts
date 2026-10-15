import { useDataMutation } from '@/services/domain/useDataQuery';
import { ingestKeyService } from '../services/ingestKey.service';
import type { IngestKey } from '../types/ingestKey.types';

export function useUpdateIngestKey( id: string )
{
    return useDataMutation<IngestKey, Partial<IngestKey>>( async ( data ) =>
    {
        const response = await ingestKeyService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
