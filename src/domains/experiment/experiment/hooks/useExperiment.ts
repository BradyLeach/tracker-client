/**
 * useExperiment
 *
 * One experiment by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { experimentService } from '../services/experiment.service';
import type { Experiment } from '../types/experiment.types';

export function useExperiment( id: string | null )
{
    return useDataQuery<Experiment | undefined>(
        () => id ? experimentService.observeById( id ) : undefined,
        [id],
    );
}
