/**
 * useMemberships
 *
 * The memberships of one account, read from the store. Stays idle until an account id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { membershipService } from '../services/membership.service';
import type { Membership } from '../types/account.types';

export function useMemberships( accountId: string | null )
{
    return useDataQuery<Membership[]>( () => accountId ? membershipService.observeByAccount( accountId ) : undefined, [accountId] );
}
