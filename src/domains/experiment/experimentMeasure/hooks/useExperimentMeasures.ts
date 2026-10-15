/**
 * useExperimentMeasures
 *
 * Every experiment measure the account holds.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { experimentMeasureService } from '../services/experimentMeasure.service';
import type { ExperimentMeasure } from '../types/experimentMeasure.types';

export function useExperimentMeasures()
{
    return useDataQuery<ExperimentMeasure[]>( () => experimentMeasureService.observeAll(), [] );
}
