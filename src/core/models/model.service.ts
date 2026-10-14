import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';

// Register all the paths for easy access and updates
const PATH = 'system/controllers/definition';
const PUBLIC_PATH = 'account/registration/definition';

/**
 * Model Service
 *
 * Fetches the backend model definitions that drive form generation and validation.
 */
export const modelService = {
    /**
     * Fetches every registered model definition.
     *
     * Authenticated — the full set describes the whole domain model.
     *
     * @returns ApiResponse containing definitions keyed by model name
     */
    async getModelDefinitions(): Promise<ApiResponse<any>>
    {
        return await dataService.getAll( PATH );
    },

    /**
     * Fetches the definitions the unauthenticated forms validate against.
     *
     * A backend whitelist — login, registration and the newsletter form are the only
     * things that render before a session exists.
     *
     * @returns ApiResponse containing the whitelisted definitions
     */
    async getPublicModelDefinitions(): Promise<ApiResponse<any>>
    {
        return await dataService.get( PUBLIC_PATH );
    }
};

