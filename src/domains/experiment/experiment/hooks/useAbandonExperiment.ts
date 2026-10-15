import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentService } from '../services/experiment.service';
import type { Experiment } from '../types/experiment.types';

/**
 * Abandons a draft or running experiment. The changed experiment is stored as returned.
 */
export function useAbandonExperiment()
{
    return useDataMutation<Experiment, string>( async ( id ) =>
    {
        const response = await experimentService.abandon( id );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
