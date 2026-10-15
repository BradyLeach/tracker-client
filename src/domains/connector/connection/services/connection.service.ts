/**
 * Connection Service
 *
 * The account's connections to configured connectors. Creating one starts its backfill
 * on the server; every pull is recorded as a connector run.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { ConnectionTestResult } from '../types/connection.types';
import type { ConnectorRun } from '../../connectorRun/types/connectorRun.types';
import type { Connection } from '../types/connection.types';

const MODEL = 'connection';
const PATH = 'connector/connections';

const base = createDomainStore<Connection>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const connectionService = {
    ...base,

    /** Checks a connection's settings reach its source. Nothing is stored. */
    testConnection( id: string ): Promise<ApiResponse<ConnectionTestResult>>
    {
        return dataService.post<ConnectionTestResult>( `${PATH}/test`, { id } );
    },

    /** Pulls now, from where the last pull reached. The finished run is stored as returned. */
    pullNow( id: string ): Promise<ApiResponse<ConnectorRun>>
    {
        return base.mutate<ConnectorRun>( () => dataService.post<ConnectorRun>( `${PATH}/pull`, { id } ) );
    },
};
