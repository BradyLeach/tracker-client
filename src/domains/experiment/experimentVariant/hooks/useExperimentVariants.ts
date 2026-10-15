/**
 * useExperimentVariants
 *
 * Every experiment variant the account holds.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { experimentVariantService } from '../services/experimentVariant.service';
import type { ExperimentVariant } from '../types/experimentVariant.types';

export function useExperimentVariants()
{
    return useDataQuery<ExperimentVariant[]>( () => experimentVariantService.observeAll(), [] );
}
