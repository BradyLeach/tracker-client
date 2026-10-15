/**
 * useIngestKey
 *
 * One ingest key by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { ingestKeyService } from '../services/ingestKey.service';
import type { IngestKey } from '../types/ingestKey.types';

export function useIngestKey( id: string | null )
{
    return useDataQuery<IngestKey | undefined>(
        () => id ? ingestKeyService.observeById( id ) : undefined,
        [id],
    );
}
