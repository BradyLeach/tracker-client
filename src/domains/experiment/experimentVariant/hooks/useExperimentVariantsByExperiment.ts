/**
 * useExperimentVariantsByExperiment
 *
 * The experimentVariants of one experiment, read from the store. Stays idle until an experiment is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { experimentVariantService } from '../services/experimentVariant.service';
import type { ExperimentVariant } from '../types/experimentVariant.types';

export function useExperimentVariantsByExperiment( experimentId: string | null )
{
    return useDataQuery<ExperimentVariant[]>(
        () => experimentId ? experimentVariantService.observeByExperiment( experimentId ) : undefined,
        [experimentId],
    );
}
