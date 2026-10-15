/**
 * useConnections
 *
 * Every connection the account holds.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { connectionService } from '../services/connection.service';
import type { Connection } from '../types/connection.types';

export function useConnections()
{
    return useDataQuery<Connection[]>( () => connectionService.observeAll(), [] );
}
