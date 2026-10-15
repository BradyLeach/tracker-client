import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentVariantService } from '../services/experimentVariant.service';
import type { ExperimentVariant } from '../types/experimentVariant.types';

/**
 * Creates an experiment variant. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateExperimentVariant()
{
    return useDataMutation<ExperimentVariant, Partial<ExperimentVariant>>( async ( data ) =>
    {
        const response = await experimentVariantService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
