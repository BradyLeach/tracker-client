/**
 * Context System
 *
 * Modular runtime state management - mirrors config pattern.
 * - getContext() for services/loggers (frozen snapshot, outside React)
 * - useTheme/useLanguage/useProfile/useMenu for components (reactive)
 * - hydrateContextBulk() for post-auth hydration
 */

import { getThemeState } from './theme/Theme.context';
import { getLanguageState } from './language/Language.context';
import { getCurrencyState } from './currency/Currency.context';
import { getCountryState } from './country/Country.context';
import { getProfileState } from './profile/Profile.context';
import { getMenuState } from './menu/Menu.context';
import type { AppContextState } from './types';

/**
 * Get frozen snapshot of all context state
 * For use outside React (services, loggers, etc.)
 *
 * @returns Frozen object with all context state
 */
export function getContext(): Readonly<AppContextState>
{
    return Object.freeze( {
        theme: getThemeState(),
        language: getLanguageState(),
        currency: getCurrencyState(),
        country: getCountryState(),
        profile: getProfileState(),
        menu: getMenuState(),
    } );
}

// Hydration
export { hydrateContextBulk } from './bulkHydration';

// Types
export type {
    ThemeContextShape,
    LanguageContextShape,
    CurrencyContextShape,
    CountryContextShape,
    ProfileContextShape,
    MenuContextShape,
    AppContextState,
    HydrationData,
} from './types';

// Hooks (for React components)
export { useTheme } from './theme/Theme.context';
export { useLanguage } from './language/Language.context';
export { useCurrency } from './currency/Currency.context';
export { useCountry } from './country/Country.context';
export { useProfile } from './profile/Profile.context';
export { useMenu } from './menu/Menu.context';

// Setters (for hydration/logout outside React)
export { getProfileSetters } from './profile/Profile.context';
export { getMenuSetters } from './menu/Menu.context';

// Providers
export { ThemeProvider } from './theme/Theme.context';
export { LanguageProvider } from './language/Language.context';
export { CurrencyProvider } from './currency/Currency.context';
export { CountryProvider } from './country/Country.context';
export { ProfileProvider } from './profile/Profile.context';
export { MenuProvider } from './menu/Menu.context';
