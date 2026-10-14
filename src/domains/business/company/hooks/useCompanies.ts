/**
 * useCompanies
 *
 * Every company the account holds, read from the store.
 *
 * The subscription is bound to the query rather than to a request, so any write to a
 * matching record re-emits here — whatever caused it.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { companyService } from '../services/company.service';
import type { Company } from '../types/company.types';

export function useCompanies()
{
    return useDataQuery<Company[]>( () => companyService.observeAll(), [] );
}
