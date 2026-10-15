/**
 * useLearnings
 *
 * Every learning the account holds, newest first.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { learningService } from '../services/learning.service';
import type { Learning } from '../types/learning.types';

export function useLearnings()
{
    return useDataQuery<Learning[]>( () => learningService.observeAll(), [] );
}
