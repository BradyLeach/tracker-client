/**
 * useLocationsByCompany
 *
 * All locations belonging to one company, read from the store.
 * Stays idle until a companyId is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { locationService } from '../services/location.service';
import type { Location } from '../types/location.types';

export function useLocationsByCompany( companyId: string | undefined )
{
    return useDataQuery<Location[]>(
        () => companyId ? locationService.observeByCompany( companyId ) : undefined,
        [companyId],
    );
}
