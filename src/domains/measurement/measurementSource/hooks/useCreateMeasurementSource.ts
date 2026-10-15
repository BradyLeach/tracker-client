import { useDataMutation } from '@/services/domain/useDataQuery';
import { measurementSourceService } from '../services/measurementSource.service';
import type { MeasurementSource } from '../types/measurementSource.types';

/**
 * Creates a measurement source. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateMeasurementSource()
{
    return useDataMutation<MeasurementSource, Partial<MeasurementSource>>( async ( data ) =>
    {
        const response = await measurementSourceService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
