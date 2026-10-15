/**
 * useConnectorRun
 *
 * One connector run by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { connectorRunService } from '../services/connectorRun.service';
import type { ConnectorRun } from '../types/connectorRun.types';

export function useConnectorRun( id: string | null )
{
    return useDataQuery<ConnectorRun | undefined>(
        () => id ? connectorRunService.observeById( id ) : undefined,
        [id],
    );
}
