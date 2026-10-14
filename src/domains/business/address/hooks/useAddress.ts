/**
 * useAddress
 *
 * One address by id, read from the store. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { addressService } from '../services/address.service';
import type { Address } from '../types/address.types';

export function useAddress( id: string | null )
{
    return useDataQuery<Address | undefined>( () => id ? addressService.observeById( id ) : undefined, [id] );
}
