/**
 * Ingest Key Service
 *
 * Keys that authenticate the push event API. The key itself is returned once, by
 * create, and never stored or shown again; the store holds only its prefix.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { IngestKey } from '../types/ingestKey.types';

const MODEL = 'ingestKey';
const PATH = 'ingest/keys';

const base = createDomainStore<IngestKey>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const ingestKeyService = {
    ...base,

    /** Revokes a key at once and for good. The changed key is stored as returned. */
    revoke( id: string ): Promise<ApiResponse<IngestKey>>
    {
        return base.mutate<IngestKey>( () => dataService.post<IngestKey>( `${PATH}/revoke`, { id } ) );
    },
};
