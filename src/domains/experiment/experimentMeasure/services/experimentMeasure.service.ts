/**
 * Experiment Measure Service
 *
 * What an experiment tracks: a metric, a formula, or a built-in calculator with its
 * inputs bound to metrics. Exactly one is primary and is judged against the threshold.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { ExperimentMeasure } from '../types/experimentMeasure.types';

const MODEL = 'experimentMeasure';
const PATH = 'experiment/measures';

const base = createDomainStore<ExperimentMeasure>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const experimentMeasureService = {
    ...base,

    /** The ExperimentMeasures of one experiment; a local indexed read once the experiment's edge is held. */
    observeByExperiment( experimentId: string ): DataQuerySource<ExperimentMeasure[]>
    {
        return base.observeWhere( { experimentId }, { experimentId } );
    },
};
