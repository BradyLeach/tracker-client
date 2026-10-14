/**
 * usePartnerships
 *
 * Every partnership for the authenticated account, each with its company composed in.
 *
 * The company is joined from the store rather than read off a server-nested tree, so a
 * company rename re-emits every row showing it with nothing subscribed to companies here.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { partnershipService } from '../services/partnership.service';
import type { Partnership } from '../types/partnership.types';

export function usePartnerships()
{
    return useDataQuery<Partnership[]>( () => partnershipService.observeAll(), [] );
}
