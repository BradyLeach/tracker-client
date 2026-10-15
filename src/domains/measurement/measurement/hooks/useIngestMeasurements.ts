import { useDataMutation } from '@/services/domain/useDataQuery';
import { measurementService } from '../services/measurement.service';
import type { Measurement, IngestPayload } from '../types/measurement.types';

/**
 * Ingests measurements for one source — manual entry and bulk ingest. Every written
 * measurement is shredded into the store.
 */
export function useIngestMeasurements()
{
    return useDataMutation<Measurement[], IngestPayload>( async ( payload ) =>
    {
        const response = await measurementService.ingest( payload );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
