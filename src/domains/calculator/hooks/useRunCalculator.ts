import { useDataMutation } from '@/services/domain/useDataQuery';
import { calculatorService } from '../services/calculator.service';
import type { CalculatorRunPayload, CalculatorRunResult } from '../types/calculator.types';

/**
 * Runs one calculator standalone. Nothing is stored.
 */
export function useRunCalculator()
{
    return useDataMutation<CalculatorRunResult, CalculatorRunPayload>( async ( payload ) =>
    {
        const response = await calculatorService.run( payload );

        if( response.error ) throw response.error;

        return response.data!;
    } );
}
