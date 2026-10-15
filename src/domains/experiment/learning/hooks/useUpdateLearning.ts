import { useDataMutation } from '@/services/domain/useDataQuery';
import { learningService } from '../services/learning.service';
import type { Learning } from '../types/learning.types';

export function useUpdateLearning( id: string )
{
    return useDataMutation<Learning, Partial<Learning>>( async ( data ) =>
    {
        const response = await learningService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
