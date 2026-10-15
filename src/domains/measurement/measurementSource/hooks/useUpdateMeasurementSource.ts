import { useDataMutation } from '@/services/domain/useDataQuery';
import { measurementSourceService } from '../services/measurementSource.service';
import type { MeasurementSource } from '../types/measurementSource.types';

export function useUpdateMeasurementSource( id: string )
{
    return useDataMutation<MeasurementSource, Partial<MeasurementSource>>( async ( data ) =>
    {
        const response = await measurementSourceService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
