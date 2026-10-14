/**
 * Profile Service
 *
 * Handles fetching and updating user profile data.
 * Returns ApiResponse—error handling is caller's responsibility.
 */

import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { Profile } from '../types/profile.types';

const PROFILES_PATH = 'account/profiles';

export const profileService = {
    /**
     * Fetch profile by ID
     * Endpoint: GET /account/profiles/:id
     */
    async getProfile( id: string ): Promise<ApiResponse<Profile>>
    {
        return await dataService.getOne<Profile>( PROFILES_PATH, id );
    },

    /**
     * Update profile fields
     * Endpoint: PATCH /account/profiles/:id
     */
    async updateProfile( id: string, data: Partial<Profile> ): Promise<ApiResponse<Profile>>
    {
        return await dataService.update<Profile>( PROFILES_PATH, id, data );
    },
};
