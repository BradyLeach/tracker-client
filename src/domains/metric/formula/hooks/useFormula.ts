/**
 * useFormula
 *
 * One formula by id. Stays idle until an id is known.
 */

import { useDataQuery } from '@/services/domain/useDataQuery';
import { formulaService } from '../services/formula.service';
import type { Formula } from '../types/formula.types';

export function useFormula( id: string | null )
{
    return useDataQuery<Formula | undefined>(
        () => id ? formulaService.observeById( id ) : undefined,
        [id],
    );
}
