/**
 * Partnership Service
 *
 * The company each partnership points at is composed from the store rather than read off a
 * server-nested tree — that composition is why this layer exists, and it is what makes a
 * company rename re-emit every row showing it with nothing subscribed to companies at the
 * screen level.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { dataService } from '@/services/dataService/dataService';
import { createDomainStore } from '@/services/domain/createDomainStore';
import { joinOne } from '@/services/domain/joins';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { Company } from '../../company/types/company.types';
import type { Partnership } from '../types/partnership.types';

const MODEL = 'partnership';
const TRANSITION_PATH = 'system/state/graphs/transition';

const base = createDomainStore<Partnership>( {
    path: 'business/partnerships',
    model: MODEL,
    collectionIncludes: ['company'],
    recordIncludes: ['currentStateGraphState', 'stateGraph', 'company'],

    // Declared once and applied to every observation, so a table row and a detail read
    // carry the same shape without either method repeating the join.
    compose: rows => joinOne<Partnership, Company, 'company'>( MODEL, rows, 'company', 'company' ),
} );

export const partnershipService = {
    ...base,

    /**
     * The partnerships of one company, each with that company attached.
     *
     * The scope filter is passed too, so a company read that included its partnerships has
     * already satisfied this edge and the traversal is a local indexed read.
     */
    observeByCompany( companyId: string ): DataQuerySource<Partnership[]>
    {
        return base.observeWhere( { companyId }, { companyId } );
    },

    /**
     * Moves a partnership through its state graph.
     *
     * The endpoint is the state graph's rather than the partnership's, which used to mean
     * the data service had no way to know what went stale and the service had to say so by
     * hand. It returns the changed partnership, so storing the response is the whole story.
     */
    transition( partnershipId: string, transitionId: string ): Promise<ApiResponse<Partnership>>
    {
        return base.mutate<Partnership>( () => dataService.post<Partnership>( TRANSITION_PATH, {
            entityType: 'partnership',
            entityId: partnershipId,
            transitionId,
        } ) );
    },
};
