/**
 * useConnection
 *
 * One connection by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { connectionService } from '../services/connection.service';
import type { Connection } from '../types/connection.types';

export function useConnection( id: string | null )
{
    return useDataQuery<Connection | undefined>(
        () => id ? connectionService.observeById( id ) : undefined,
        [id],
    );
}
