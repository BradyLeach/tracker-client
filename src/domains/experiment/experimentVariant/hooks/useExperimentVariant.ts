/**
 * useExperimentVariant
 *
 * One experiment variant by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { experimentVariantService } from '../services/experimentVariant.service';
import type { ExperimentVariant } from '../types/experimentVariant.types';

export function useExperimentVariant( id: string | null )
{
    return useDataQuery<ExperimentVariant | undefined>(
        () => id ? experimentVariantService.observeById( id ) : undefined,
        [id],
    );
}
