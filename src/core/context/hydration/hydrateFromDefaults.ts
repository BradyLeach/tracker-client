/**
 * Hydration from Defaults
 *
 * Fetches IP-based context defaults from backend and hydrates contexts.
 * Called at app startup (unauth phase).
 * Later overridden by user preferences on auth.
 *
 * Ensures consistent initial state: language/currency/country for unauth users.
 * Respects localStorage values—doesn't override user's local preferences.
 */

import { hydrateContextBulk } from '../bulkHydration';
import { referenceService } from '@/domains/system/services/reference.service';
import type { HydrationData } from '../types';
import type { ThemeName } from '@/core/utils/constants';

export async function hydrateFromDefaults(): Promise<void>
{
    try
    {
        const response = await referenceService.getContextDefaults();

        if( response.error || !response.data )
        {
            console.warn( 'Context defaults unavailable:', response.error ?? 'no data' );
            return;
        }

        const { countryId, languageId, currencyId, themeMode, themeName } = response.data;

        const hydrationData: HydrationData = {};

        if( languageId )
        {
            hydrationData.language = { current: languageId };
        }

        if( currencyId )
        {
            hydrationData.currency = { current: currencyId };
        }

        if( countryId )
        {
            hydrationData.country = { current: countryId };
        }

        // Only set theme data if we have values (avoid undefined fields)
        if( themeMode || themeName )
        {
            const themeData: Partial<HydrationData['theme']> = {};
            if( themeMode ) themeData.mode = themeMode as 'light' | 'dark';
            if( themeName ) themeData.themeName = themeName as ThemeName;
            hydrationData.theme = themeData;
        }

        // Pass isAuthenticated: false — this is IP-based defaults for unauth users
        // Hydrators will respect localStorage if it exists
        hydrateContextBulk( hydrationData, false );
    }
    catch ( error )
    {
        console.error( 'Hydration from defaults failed:', error );
    }
}
