/**
 * useCompany
 *
 * One company by id, read from the store. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { companyService } from '../services/company.service';
import type { Company } from '../types/company.types';

export function useCompany( id: string | null )
{
    return useDataQuery<Company | undefined>( () => id ? companyService.observeById( id ) : undefined, [id] );
}
