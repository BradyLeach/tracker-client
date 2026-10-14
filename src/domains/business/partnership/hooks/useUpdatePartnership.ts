import { useDataMutation } from '@/services/domain/useDataQuery';
import { partnershipService } from '../services/partnership.service';
import type { Partnership } from '../types/partnership.types';

export function useUpdatePartnership( id: string )
{
    return useDataMutation<Partnership, Partial<Partnership>>( async ( data ) =>
    {
        const response = await partnershipService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
