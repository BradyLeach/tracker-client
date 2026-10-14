/**
 * Account Service
 *
 * Domain store for accounts. Reads come from the store as observables; writes go over
 * REST and are shredded back in. accountType is included and composed so every observer
 * receives the hydrated type alongside the account.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import { joinOne } from '@/services/domain/joins';
import { httpDataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import { addressService } from '@/domains/business/address/services/address.service';
import type { Account, AccountType, Address } from '../types/account.types';

const MODEL = 'account';
const ACCOUNTS_PATH = 'account/accounts';
const ADDRESSES_PATH = 'business/addresses';

const base = createDomainStore<Account>( {
    path: ACCOUNTS_PATH,
    model: MODEL,
    recordIncludes: ['accountType'],
    compose: rows => joinOne<Account, AccountType, 'accountType'>( MODEL, rows, 'accountType', 'accountType' ),
} );

export const accountService = {
    ...base,

    /** Addresses are their own records; the update lands in the address table like any other. */
    async updateAddress( id: string, data: Partial<Address> ): Promise<ApiResponse<Address>>
    {
        return addressService.mutate( () => httpDataService.update<Address>( ADDRESSES_PATH, id, data ) );
    },
};
