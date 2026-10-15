import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentVariantService } from '../services/experimentVariant.service';
import type { ExperimentVariant } from '../types/experimentVariant.types';

export function useUpdateExperimentVariant( id: string )
{
    return useDataMutation<ExperimentVariant, Partial<ExperimentVariant>>( async ( data ) =>
    {
        const response = await experimentVariantService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
