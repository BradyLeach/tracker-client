/**
 * useIngestKeys
 *
 * Every ingest key the account holds.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { ingestKeyService } from '../services/ingestKey.service';
import type { IngestKey } from '../types/ingestKey.types';

export function useIngestKeys()
{
    return useDataQuery<IngestKey[]>( () => ingestKeyService.observeAll(), [] );
}
