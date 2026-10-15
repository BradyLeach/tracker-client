/**
 * Learning Service
 *
 * The written conclusions experiments leave behind. Concluding records one; more can be
 * added. The account's learnings are its searchable memory of what was tried.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { Learning } from '../types/learning.types';

const MODEL = 'learning';
const PATH = 'experiment/learnings';

const base = createDomainStore<Learning>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const learningService = {
    ...base,

    /** The Learnings of one experiment; a local indexed read once the experiment's edge is held. */
    observeByExperiment( experimentId: string ): DataQuerySource<Learning[]>
    {
        return base.observeWhere( { experimentId }, { experimentId } );
    },
};
