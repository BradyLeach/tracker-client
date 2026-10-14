/**
 * useAccount
 *
 * One account by id, read from the store. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { accountService } from '../services/account.service';
import type { Account } from '../types/account.types';

export function useAccount( accountId: string | undefined )
{
    return useDataQuery<Account | undefined>( () => accountId ? accountService.observeById( accountId ) : undefined, [accountId] );
}
