import { useDataMutation } from '@/services/domain/useDataQuery';
import { experimentMeasureService } from '../services/experimentMeasure.service';
import type { ExperimentMeasure } from '../types/experimentMeasure.types';

export function useUpdateExperimentMeasure( id: string )
{
    return useDataMutation<ExperimentMeasure, Partial<ExperimentMeasure>>( async ( data ) =>
    {
        const response = await experimentMeasureService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
