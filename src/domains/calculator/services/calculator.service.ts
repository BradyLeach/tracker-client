/**
 * Calculator Service
 *
 * The built-in calculator registry and standalone runs. Calculators are pure and hold no
 * account data, so nothing here touches the store.
 */

import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { CalculatorDescriptor, CalculatorRunPayload, CalculatorRunResult } from '../types/calculator.types';

const PATH = 'system/calculators';

export const calculatorService = {
    /** Every built-in calculator's descriptor. */
    list(): Promise<ApiResponse<CalculatorDescriptor[]>>
    {
        return dataService.get<CalculatorDescriptor[]>( PATH );
    },

    /** Runs one calculator with named input values. */
    run( payload: CalculatorRunPayload ): Promise<ApiResponse<CalculatorRunResult>>
    {
        return dataService.post<CalculatorRunResult>( `${PATH}/run`, payload );
    },
};
