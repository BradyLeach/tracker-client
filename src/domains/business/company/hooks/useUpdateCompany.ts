/**
 * useUpdateCompany
 *
 * The response is shredded into the store, so every subscriber re-emits on its own —
 * including the partnership rows that join this company in. There is nothing to invalidate.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { companyService } from '../services/company.service';
import type { Company } from '../types/company.types';

export function useUpdateCompany( id: string )
{
    return useDataMutation<Company, Partial<Company>>( async ( data ) =>
    {
        const response = await companyService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
