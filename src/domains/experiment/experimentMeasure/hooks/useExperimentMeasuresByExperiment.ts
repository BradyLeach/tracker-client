/**
 * useExperimentMeasuresByExperiment
 *
 * The experimentMeasures of one experiment, read from the store. Stays idle until an experiment is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { experimentMeasureService } from '../services/experimentMeasure.service';
import type { ExperimentMeasure } from '../types/experimentMeasure.types';

export function useExperimentMeasuresByExperiment( experimentId: string | null )
{
    return useDataQuery<ExperimentMeasure[]>(
        () => experimentId ? experimentMeasureService.observeByExperiment( experimentId ) : undefined,
        [experimentId],
    );
}
