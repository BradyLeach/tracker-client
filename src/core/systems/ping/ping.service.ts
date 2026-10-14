import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';

// Register all the paths for easy access and updates
const PATH = 'system/ping';

/**
 * Registration Service
 *
 * Handles account registration logic (sign-up, handle checks, etc.)
 */
export const pingService = {
    /**
     * Submit registration form and create signupAttempt
     *
     * @param fields - Registration form fields
     * @returns ApiResponse containing the result
     */
    async ping(): Promise<ApiResponse<any>>
    {
        return await dataService.getAll( PATH );
    }
};
