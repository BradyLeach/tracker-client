/**
 * Membership Service
 *
 * Domain store for memberships. Reads come from the store as observables; writes go over
 * REST and are shredded back in.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { Membership } from '../types/account.types';

const MODEL = 'membership';
const PATH = 'admin/system/memberships';

const base = createDomainStore<Membership>( {
    path: PATH,
    model: MODEL,
} );

export const membershipService = {
    ...base,

    /** The memberships of one account. */
    observeByAccount( accountId: string ): DataQuerySource<Membership[]>
    {
        return base.observeWhere( { memberOfId: accountId }, { memberOfId: accountId } );
    },
};
