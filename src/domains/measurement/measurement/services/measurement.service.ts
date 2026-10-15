/**
 * Measurement Service
 *
 * The account's measurement time series. Measurements are never created or updated
 * through the resource: every write is an ingest, which the server makes idempotent.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { IngestPayload } from '../types/measurement.types';
import type { Measurement } from '../types/measurement.types';

const MODEL = 'measurement';
const PATH = 'measurement/measurements';

const base = createDomainStore<Measurement>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const measurementService = {
    ...base,

    /**
     * The measurements of one source. The scope filter is passed too, so a source read that
     * already holds them is a local indexed read.
     */
    observeBySource( measurementSourceId: string ): DataQuerySource<Measurement[]>
    {
        return base.observeWhere( { measurementSourceId }, { measurementSourceId } );
    },

    /**
     * Ingests a batch for one source — bulk ingest and manual entry. Re-ingesting a
     * measurement updates it; the written measurements are stored as returned.
     */
    ingest( payload: IngestPayload ): Promise<ApiResponse<Measurement[]>>
    {
        return base.mutate<Measurement[]>( () => dataService.post<Measurement[]>( `${PATH}/ingest`, payload ) );
    },
};
