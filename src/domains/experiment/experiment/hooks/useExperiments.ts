/**
 * useExperiments
 *
 * Every experiment the account holds, with its current state.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { experimentService } from '../services/experiment.service';
import type { Experiment } from '../types/experiment.types';

export function useExperiments()
{
    return useDataQuery<Experiment[]>( () => experimentService.observeAll(), [] );
}
