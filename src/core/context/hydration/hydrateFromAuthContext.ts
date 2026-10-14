/**
 * Hydration from Auth Context
 *
 * Fetches unified auth context from backend and hydrates all context groups:
 * - Profile context (identity + profile)
 * - Preference contexts (theme, language, currency)
 * - Menu context (navigation config)
 *
 * Called after successful authentication before navigating to app.
 */

import { hydrateContextBulk } from '../bulkHydration';
import { getMenuSetters } from '../menu/Menu.context';
import { authenticationService } from '@/domains/authentication/services/authentication.services';
import { TRACKER_NAV_ITEMS } from '@/config/menus/appNav/appNav.config';
import type { HydrationData } from '../types';
import type { ThemeName } from '@/core/utils/constants';
import { logger } from '@/core/utils/logger';

export async function hydrateFromAuthContext(): Promise<void>
{
    try
    {
        const response = await authenticationService.getAuthContext();

        if( response.error )
        {
            logger.error( 'Failed to load auth context', { error: response.error } );
            return; // Fail gracefully—use defaults
        }

        if( !response.data )
        {
            logger.warn( 'No auth context data returned' );
            return;
        }

        const { profile, appPreference } = response.data;

        // Preserve backend profile fields unchanged; Identity display names are composed by the UI.
        // Profile is required; preferences are optional.
        const hydrationData: HydrationData = {
            profile: {
                profile,
                appPreferenceId: appPreference?.id,
            },
            ...( appPreference && {
                language: { current: appPreference.languageId },
                currency: { current: appPreference.currencyId },
                theme: {
                    mode: appPreference.themeMode as 'light' | 'dark',
                    themeName: appPreference.themeName as ThemeName,
                    direction: appPreference.direction as 'ltr' | 'rtl'
                },
            } ),
        };

        // Hydrate with isAuthenticated: true
        // User preferences always override localStorage during authenticated hydration
        hydrateContextBulk( hydrationData, true );

        // Hydrate menu context with navigation config (temporary until /me endpoint)
        const menuSetters = getMenuSetters();
        menuSetters.setConfig?.( TRACKER_NAV_ITEMS );
    }
    catch ( error )
    {
        logger.error( 'Auth context hydration failed', { error } );
        // Fail gracefully—app continues with defaults
    }
}
