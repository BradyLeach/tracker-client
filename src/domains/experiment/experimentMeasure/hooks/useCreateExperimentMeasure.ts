import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentMeasureService } from '../services/experimentMeasure.service';
import type { ExperimentMeasure } from '../types/experimentMeasure.types';

/**
 * Creates an experiment measure. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateExperimentMeasure()
{
    return useDataMutation<ExperimentMeasure, Partial<ExperimentMeasure>>( async ( data ) =>
    {
        const response = await experimentMeasureService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
