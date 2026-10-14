import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';

// Register all the paths for easy access and updates
const PATH = 'system/controllers/business-rules';

/**
 * Rule Service
 *
 * Handles all Rule ish
 */
export const ruleService = {
    /**
     * Submit registration form and create signupAttempt
     *
     * @param fields - Registration form fields
     * @returns ApiResponse containing the result
     */
    async getRules(): Promise<ApiResponse<any>>
    {
        return await dataService.getAll( PATH );
    }
};
