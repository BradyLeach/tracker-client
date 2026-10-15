/**
 * Experiment Service
 *
 * Experiments on the experiment state graph: draft, running, concluded, abandoned.
 * Lifecycle moves go through the experiment's own actions rather than the generic
 * transition endpoint, because starting and concluding carry rules the server enforces.
 * Results are computed at read time (or read from the frozen snapshot), so they are
 * fetched, not observed.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { ConclusionPayload, ExperimentResults } from '../types/experiment.types';
import type { ResultGrouping } from '@/domains/metric';
import type { Experiment } from '../types/experiment.types';

const MODEL = 'experiment';
const PATH = 'experiment/experiments';

const base = createDomainStore<Experiment>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: ['currentStateGraphState'],
    recordIncludes: ['currentStateGraphState', 'stateGraph'],
} );

export const experimentService = {
    ...base,

    /** Starts a draft. Refused until it has a threshold, a window, a primary measure and a control. */
    start( id: string ): Promise<ApiResponse<Experiment>>
    {
        return base.mutate<Experiment>( () => dataService.post<Experiment>( `${PATH}/start`, { id } ) );
    },

    /** Concludes a running experiment with a decision and a learning, freezing its results. */
    conclude( payload: ConclusionPayload ): Promise<ApiResponse<Experiment>>
    {
        return base.mutate<Experiment>( () => dataService.post<Experiment>( `${PATH}/conclude`, payload ) );
    },

    /** Abandons a draft or running experiment without a conclusion. */
    abandon( id: string ): Promise<ApiResponse<Experiment>>
    {
        return base.mutate<Experiment>( () => dataService.post<Experiment>( `${PATH}/abandon`, { id } ) );
    },

    /** Results for one trend grouping: live for a running experiment, frozen once concluded. */
    getResults( id: string, groupBy: ResultGrouping ): Promise<ApiResponse<ExperimentResults>>
    {
        return dataService.post<ExperimentResults>( `${PATH}/results`, { id, groupBy } );
    },
};
