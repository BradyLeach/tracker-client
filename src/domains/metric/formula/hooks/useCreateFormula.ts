import { useDataMutation } from '@/services/domain/useDataQuery';
import { formulaService } from '../services/formula.service';
import type { Formula } from '../types/formula.types';

/**
 * Creates a formula. The response is shredded into the store, so every subscriber
 * re-emits on its own.
 */
export function useCreateFormula()
{
    return useDataMutation<Formula, Partial<Formula>>( async ( data ) =>
    {
        const response = await formulaService.create( data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
