import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentService } from '../services/experiment.service';
import type { Experiment } from '../types/experiment.types';

/**
 * Creates an experiment. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateExperiment()
{
    return useDataMutation<Experiment, Partial<Experiment>>( async ( data ) =>
    {
        const response = await experimentService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
