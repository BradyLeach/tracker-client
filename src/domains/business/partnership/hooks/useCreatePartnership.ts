import { useDataMutation } from '@/services/domain/useDataQuery';
import { partnershipService } from '../services/partnership.service';
import type { Partnership } from '../types/partnership.types';

/**
 * Creates a partnership against an existing companyId. The response is shredded into the
 * store, so every subscriber re-emits on its own.
 */
export function useCreatePartnership()
{
    return useDataMutation<Partnership, Partial<Partnership>>( async ( data ) =>
    {
        const response = await partnershipService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
