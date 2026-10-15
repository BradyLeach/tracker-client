/**
 * Experiment Variant Service
 *
 * An experiment's control and variants. Each carries per-source attribution: a
 * measurement counts toward a variant only through that variant's filters.
 *
 * The shared surface comes from createDomainStore; only what is genuinely this domain's
 * lives here.
 */

import { createDomainStore } from '@/services/domain/createDomainStore';
import type { DataQuerySource } from '@/services/domain/useDataQuery';
import type { ExperimentVariant } from '../types/experimentVariant.types';

const MODEL = 'experimentVariant';
const PATH = 'experiment/variants';

const base = createDomainStore<ExperimentVariant>( {
    path: PATH,
    model: MODEL,
    collectionIncludes: [],
    recordIncludes: [],
} );

export const experimentVariantService = {
    ...base,

    /** The ExperimentVariants of one experiment; a local indexed read once the experiment's edge is held. */
    observeByExperiment( experimentId: string ): DataQuerySource<ExperimentVariant[]>
    {
        return base.observeWhere( { experimentId }, { experimentId } );
    },
};
