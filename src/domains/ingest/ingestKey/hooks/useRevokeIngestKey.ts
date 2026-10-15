import { useDataMutation } from '@/services/domain/useDataQuery';
import { ingestKeyService } from '../services/ingestKey.service';
import type { IngestKey } from '../types/ingestKey.types';

/**
 * Revokes an ingest key. The changed key is stored as returned.
 */
export function useRevokeIngestKey()
{
    return useDataMutation<IngestKey, string>( async ( id ) =>
    {
        const response = await ingestKeyService.revoke( id );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
