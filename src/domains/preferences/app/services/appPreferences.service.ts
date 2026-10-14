/**
 * App Preferences Service
 *
 * Handles fetching and persisting user app preferences.
 * Returns ApiResponse—error handling is caller's responsibility.
 */

import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { AppPreferences } from '../types/appPreferences.types';
import type { LanguageId, CurrencyId } from '@/core/types/ids';
import type { ThemeName, ThemeMode, ThemeDirection } from '@/core/utils/constants';

const PREFERENCES_PATH = 'preferences/app';

export const appPreferencesService = {
    /**
     * Fetch current user's app preferences
     * Endpoint: GET /preferences/app/:id
     */
    async getAppPreferences( id: string ): Promise<ApiResponse<AppPreferences>>
    {
        return await dataService.getOne<AppPreferences>( PREFERENCES_PATH, id );
    },

    /**
     * Update language preference
     * Endpoint: PATCH /preferences/app/{id}
     * Fire-and-forget pattern—caller does not wait
     */
    async updateLanguage( id: string, languageId: LanguageId ): Promise<void>
    {
        void dataService.update( PREFERENCES_PATH, id, { languageId } );
    },

    /**
     * Update currency preference
     * Endpoint: PATCH /preferences/app/{id}
     * Fire-and-forget pattern—caller does not wait
     */
    async updateCurrency( id: string, currencyId: CurrencyId ): Promise<void>
    {
        void dataService.update( PREFERENCES_PATH, id, { currencyId } );
    },

    /**
     * Update theme preference
     * Endpoint: PATCH /preferences/app/{id}
     * Fire-and-forget pattern—caller does not wait
     */
    async updateTheme(
        id: string,
        themeMode: ThemeMode,
        themeName: ThemeName
    ): Promise<void>
    {
        void dataService.update( PREFERENCES_PATH, id, {
            themeMode,
            themeName
        } );
    },

    /**
     * Update text direction preference
     * Endpoint: PATCH /preferences/app/{id}
     * Fire-and-forget pattern—caller does not wait
     */
    async updateDirection( id: string, direction: ThemeDirection ): Promise<void>
    {
        void dataService.update( PREFERENCES_PATH, id, {
            direction
        } );
    }
};
