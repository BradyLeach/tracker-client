/**
 * usePartnership
 *
 * One partnership by id, with its company composed in. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { partnershipService } from '../services/partnership.service';
import type { Partnership } from '../types/partnership.types';

export function usePartnership( id: string | null )
{
    return useDataQuery<Partnership | undefined>(
        () => id ? partnershipService.observeById( id ) : undefined,
        [id],
    );
}
