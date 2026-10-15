import { useDataMutation } from '@/services/domain/useDataQuery';
import { learningService } from '../services/learning.service';
import type { Learning } from '../types/learning.types';

/**
 * Creates a learning. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateLearning()
{
    return useDataMutation<Learning, Partial<Learning>>( async ( data ) =>
    {
        const response = await learningService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
