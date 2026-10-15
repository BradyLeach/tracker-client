import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentService } from '../services/experiment.service';
import { learningService } from '../../learning/services/learning.service';
import type { Experiment, ConclusionPayload } from '../types/experiment.types';

/**
 * Concludes a running experiment. The server records the learning in the same
 * transaction, so the learning collection is re-read once the conclusion lands.
 */
export function useConcludeExperiment()
{
    return useDataMutation<Experiment, ConclusionPayload>( async ( payload ) =>
    {
        const response = await experimentService.conclude( payload );

        if( response.error ) throw response.error;

        await learningService.refresh();

        return response.data!;
    } );
}
