import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentService } from '../services/experiment.service';
import type { Experiment } from '../types/experiment.types';

/**
 * Starts a draft experiment. The changed experiment is stored as returned.
 */
export function useStartExperiment()
{
    return useDataMutation<Experiment, string>( async ( id ) =>
    {
        const response = await experimentService.start( id );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
