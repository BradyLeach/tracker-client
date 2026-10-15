import { useDataMutation } from '@/services/domain/useDataQuery';
import { formulaService } from '../services/formula.service';
import type { Formula } from '../types/formula.types';

export function useUpdateFormula( id: string )
{
    return useDataMutation<Formula, Partial<Formula>>( async ( data ) =>
    {
        const response = await formulaService.update( id, data );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
