/**
 * Address Service
 *
 * Domain store for addresses. Reads come from the store as observables; writes go over
 * REST and are shredded back in.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { Address } from '../types/address.types';

const MODEL = 'address';
const PATH = 'business/addresses';

export const addressService = createDomainStore<Address>( {
    path: PATH,
    model: MODEL,
} );
