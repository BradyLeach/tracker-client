/**
 * useConnectorRunsByConnection
 *
 * The runs of one connection, read from the store. Stays idle until a connection is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { connectorRunService } from '../services/connectorRun.service';
import type { ConnectorRun } from '../types/connectorRun.types';

export function useConnectorRunsByConnection( connectionId: string | null )
{
    return useDataQuery<ConnectorRun[]>(
        () => connectionId ? connectorRunService.observeByConnection( connectionId ) : undefined,
        [connectionId],
    );
}
