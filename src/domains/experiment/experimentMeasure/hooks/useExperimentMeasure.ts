/**
 * useExperimentMeasure
 *
 * One experiment measure by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { experimentMeasureService } from '../services/experimentMeasure.service';
import type { ExperimentMeasure } from '../types/experimentMeasure.types';

export function useExperimentMeasure( id: string | null )
{
    return useDataQuery<ExperimentMeasure | undefined>(
        () => id ? experimentMeasureService.observeById( id ) : undefined,
        [id],
    );
}
