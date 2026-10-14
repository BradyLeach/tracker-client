/**
 * useIdentity
 *
 * One identity by id, read from the store. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { identityService } from '../services/identity.service';
import type { Identity } from '../types/identity.types';

export function useIdentity( id: string | undefined )
{
    return useDataQuery<Identity | undefined>( () => id ? identityService.observeById( id ) : undefined, [id] );
}
