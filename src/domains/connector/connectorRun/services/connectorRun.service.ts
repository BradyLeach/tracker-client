/**
 * Connector Run Service
 *
 * The record of every pull: why it ran, its window, how it ended, how much it wrote and
 * any error. Written only by the server.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { ConnectorRun } from '../types/connectorRun.types';

const MODEL = 'connectorRun';
const PATH = 'connector/runs';

const base = createDomainStore<ConnectorRun>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const connectorRunService = {
    ...base,

    /** The runs of one connection; a local indexed read once the connection's edge is held. */
    observeByConnection( connectionId: string ): DataQuerySource<ConnectorRun[]>
    {
        return base.observeWhere( { connectionId }, { connectionId } );
    },
};
