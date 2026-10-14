/**
 * Context System Types
 *
 * Shape interfaces for modular context system.
 * Mirrors config pattern - runtime state initialized from getConfig() defaults.
 */

import type { ThemeMode, ThemeName, ThemeDirection } from '@/core/utils/constants';
import type { SidebarNavItemConfig } from '@/components/configMenu';
import type { Profile } from '@/domains/account/profile/types/profile.types';

/**
 * Theme context shape
 * Defaults from config.ui
 */
export interface ThemeContextShape
{
    mode: ThemeMode;
    direction: ThemeDirection;
    themeName: ThemeName;
}

/**
 * Language context shape
 * Stores only the current language ID (UUID from backend).
 * Components resolve full language via useSystemLanguages() query.
 */
export interface LanguageContextShape
{
    current: string; // UUID from backend (e.g., 'uuid-abc-123')
}

/**
 * Currency context shape
 * Stores only the current currency code (ID/key).
 * Components resolve full currency via useSystemCurrencies() query.
 */
export interface CurrencyContextShape
{
    current: string; // e.g., 'USD', 'AUD'
}

/**
 * Country context shape
 * Stores only the current country code (ID/key).
 * Components resolve full country via useSystemCountries() query.
 */
export interface CountryContextShape
{
    current: string; // e.g., 'US', 'AU'
}

/**
 * Profile context shape
 * Holds the authenticated backend profile unchanged.
 */
export interface ProfileContextShape
{
    /**
     * Current authenticated profile returned by /auth/context.
     * Stored unchanged; display names are composed from Identity data by the UI.
     * ownerId identifies the owning account; handle identifies the profile.
     * avatarURL retains the backend property name.
     * Undefined before authentication hydration and after logout.
     */
    profile: Profile | undefined;
    appPreferenceId: string | undefined;
}

/**
 * Menu context shape
 * Navigation config from backend post-auth
 */
export interface MenuContextShape
{
    config: SidebarNavItemConfig[];
    collapsed: boolean;
}

/**
 * Combined context state for getContext()
 */
export interface AppContextState
{
    theme: ThemeContextShape;
    language: LanguageContextShape;
    currency: CurrencyContextShape;
    country: CountryContextShape;
    profile: ProfileContextShape;
    menu: MenuContextShape;
}

/**
 * Hydration data shape for post-auth hydration
 * Note: Menu excluded - system-wide based on account type, not profile preferences
 */
export interface HydrationData
{
    theme?: Partial<ThemeContextShape>;
    language?: Partial<LanguageContextShape>;
    currency?: Partial<CurrencyContextShape>;
    country?: Partial<CountryContextShape>;
    profile?: Partial<ProfileContextShape>;
}

