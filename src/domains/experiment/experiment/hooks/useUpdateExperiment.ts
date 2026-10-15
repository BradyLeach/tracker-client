import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentService } from '../services/experiment.service';
import type { Experiment } from '../types/experiment.types';

export function useUpdateExperiment( id: string )
{
    return useDataMutation<Experiment, Partial<Experiment>>( async ( data ) =>
    {
        const response = await experimentService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
