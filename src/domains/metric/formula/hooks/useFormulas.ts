/**
 * useFormulas
 *
 * Every formula the account holds.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { formulaService } from '../services/formula.service';
import type { Formula } from '../types/formula.types';

export function useFormulas()
{
    return useDataQuery<Formula[]>( () => formulaService.observeAll(), [] );
}
