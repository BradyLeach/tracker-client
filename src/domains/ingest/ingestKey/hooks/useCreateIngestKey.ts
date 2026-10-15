import { useDataMutation } from '@/services/domain/useDataQuery';
import { ingestKeyService } from '../services/ingestKey.service';
import type { IngestKey } from '../types/ingestKey.types';

/**
 * Creates an ingest key. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateIngestKey()
{
    return useDataMutation<IngestKey, Partial<IngestKey>>( async ( data ) =>
    {
        const response = await ingestKeyService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
