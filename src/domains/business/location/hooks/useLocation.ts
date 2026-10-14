/**
 * useLocation
 *
 * One location by id, read from the store. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { locationService } from '../services/location.service';
import type { Location } from '../types/location.types';

export function useLocation( id: string | null )
{
    return useDataQuery<Location | undefined>( () => id ? locationService.observeById( id ) : undefined, [id] );
}
