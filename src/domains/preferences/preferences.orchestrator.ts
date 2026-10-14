/**
 * Preferences Orchestrator
 *
 * Cross-domain coordination layer.
 * Decides whether to persist preference changes to backend.
 * - Authenticated: update context + persist to backend
 * - Unauthenticated: update context only
 *
 * Services stay auth-agnostic. UI stays dumb.
 * This layer owns the orchestration logic.
 */

import { appPreferencesService } from '@/domains/preferences/app/services/appPreferences.service';
import { getLanguageSetters } from '@/core/context/language/Language.context';
import { getCurrencySetters } from '@/core/context/currency/Currency.context';
import { getThemeSetters } from '@/core/context/theme/Theme.context';
import { getCountrySetters } from '@/core/context/country/Country.context';
import { getProfileState } from '@/core/context/profile/Profile.context';
import type { LanguageId, CurrencyId, CountryId } from '@/core/types/ids';
import type { ThemeName, ThemeMode, ThemeDirection } from '@/core/utils/constants';

/**
 * Check if user is authenticated
 * Authenticated = profile.id exists
 * Unauthenticated = no profile.id
 */
function isAuthenticated(): boolean
{
    return Boolean( getProfileState().profile?.id );
}

/**
 * Get the stored app preference ID for PATCH calls.
 * Returns undefined if not yet hydrated.
 */
function getAppPreferenceId(): string | undefined
{
    return getProfileState().appPreferenceId;
}

export const preferencesOrchestrator = {
    /**
     * Update language preference
     * - Always updates context
     * - Persists to backend if authenticated
     */
    async updateLanguage( languageId: LanguageId ): Promise<void>
    {
        const { setCurrent } = getLanguageSetters();
        setCurrent?.( languageId );

        const preferenceId = getAppPreferenceId();
        if( isAuthenticated() && preferenceId )
        {
            await appPreferencesService.updateLanguage( preferenceId, languageId );
        }
    },

    /**
     * Update currency preference
     * - Always updates context
     * - Persists to backend if authenticated
     */
    async updateCurrency( currencyId: CurrencyId ): Promise<void>
    {
        const { setCurrent } = getCurrencySetters();
        setCurrent?.( currencyId );

        const preferenceId = getAppPreferenceId();
        if( isAuthenticated() && preferenceId )
        {
            await appPreferencesService.updateCurrency( preferenceId, currencyId );
        }
    },

    /**
     * Update country preference
     * - Always updates context
     * - Persists to backend if authenticated
     */
    async updateCountry( countryId: CountryId ): Promise<void>
    {
        const { setCurrent } = getCountrySetters();
        setCurrent?.( countryId );

        if( isAuthenticated() )
        {
            // TODO: Add updateCountry to appPreferencesService if needed
            // await appPreferencesService.updateCountry(countryId);
        }
    },

    /**
     * Update theme preference
     * - Always updates context
     * - Persists to backend if authenticated
     */
    async updateTheme(
        themeMode: ThemeMode,
        themeName: ThemeName
    ): Promise<void>
    {
        const { setMode, setThemeName } = getThemeSetters();
        setMode?.( themeMode );
        setThemeName?.( themeName );

        const preferenceId = getAppPreferenceId();
        if( isAuthenticated() && preferenceId )
        {
            await appPreferencesService.updateTheme( preferenceId, themeMode, themeName );
        }
    },

    /**
     * Update text direction preference
     * - Always updates context
     * - Persists to backend if authenticated
     */
    async updateDirection( direction: ThemeDirection ): Promise<void>
    {
        const { setDirection } = getThemeSetters();
        setDirection?.( direction );

        const preferenceId = getAppPreferenceId();
        if( isAuthenticated() && preferenceId )
        {
            await appPreferencesService.updateDirection( preferenceId, direction );
        }
    }
};
