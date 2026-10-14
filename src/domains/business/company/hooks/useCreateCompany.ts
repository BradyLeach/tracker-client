/**
 * useCreateCompany
 *
 * Creates a company. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */

import { useDataMutation } from '@/services/domain/useDataQuery';
import { companyService } from '../services/company.service';
import type { Company } from '../types/company.types';

export function useCreateCompany()
{
    return useDataMutation<Company, Partial<Company>>( async ( data ) =>
    {
        const response = await companyService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
