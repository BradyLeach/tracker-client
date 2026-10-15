import { useDataMutation } from '@/services/domain/useDataQuery';
import { metricService } from '../services/metric.service';
import type { Metric } from '../types/metric.types';

/**
 * Creates a metric. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateMetric()
{
    return useDataMutation<Metric, Partial<Metric>>( async ( data ) =>
    {
        const response = await metricService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
