/**
 * useLearning
 *
 * One learning by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { learningService } from '../services/learning.service';
import type { Learning } from '../types/learning.types';

export function useLearning( id: string | null )
{
    return useDataQuery<Learning | undefined>(
        () => id ? learningService.observeById( id ) : undefined,
        [id],
    );
}
