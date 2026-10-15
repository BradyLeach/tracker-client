/**
 * useConnectorRuns
 *
 * Every connector run the account holds, newest first.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { connectorRunService } from '../services/connectorRun.service';
import type { ConnectorRun } from '../types/connectorRun.types';

export function useConnectorRuns()
{
    return useDataQuery<ConnectorRun[]>( () => connectorRunService.observeAll(), [] );
}
