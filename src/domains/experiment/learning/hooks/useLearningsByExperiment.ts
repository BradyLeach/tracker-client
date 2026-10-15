/**
 * useLearningsByExperiment
 *
 * The learnings of one experiment, read from the store. Stays idle until an experiment is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { learningService } from '../services/learning.service';
import type { Learning } from '../types/learning.types';

export function useLearningsByExperiment( experimentId: string | null )
{
    return useDataQuery<Learning[]>(
        () => experimentId ? learningService.observeByExperiment( experimentId ) : undefined,
        [experimentId],
    );
}
