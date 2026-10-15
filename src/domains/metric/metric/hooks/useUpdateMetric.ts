import { useDataMutation } from '@/services/domain/useDataQuery';
import { metricService } from '../services/metric.service';
import type { Metric } from '../types/metric.types';

export function useUpdateMetric( id: string )
{
    return useDataMutation<Metric, Partial<Metric>>( async ( data ) =>
    {
        const response = await metricService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
