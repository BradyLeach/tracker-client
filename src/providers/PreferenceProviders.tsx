/**
 * PreferencesProvider
 *
 * Groups all user preference contexts into a single provider.
 * This includes theme, language, and internationalization sync.
 * Used to wrap the application in a clean, readable way.
 *
 * - ThemeProvider: Controls mode, direction, and themeName
 * - LanguageProvider: Controls current language and available options
 * - I18nSync: Syncs LanguageContext to i18n and dayjs
 *
 * @module PreferencesProvider
 */

import { type ReactNode } from 'react';
import
{
    ThemeProvider,
    LanguageProvider,
    CurrencyProvider,
    CountryProvider
} from '@/core/context';

/**
 * PreferencesProvider Props
 *
 * @typedef {Object} PreferencesProviderProps
 * @property {ReactNode} children - The child components to wrap with preference contexts
 */
interface PreferencesProviderProps
{
    children: ReactNode;
}

/**
 * PreferencesProvider
 *
 * Wraps all user preference contexts (theme, language, currency, country, i18n sync).
 * Keeps the provider tree clean and groups related concerns.
 *
 * @param {PreferencesProviderProps} props - The provider props
 * @returns {JSX.Element} Provider-wrapped children
 */
export function PreferencesProvider( { children }: PreferencesProviderProps )
{
    return (
        <ThemeProvider>
            <LanguageProvider>
                <CurrencyProvider>
                    <CountryProvider>
                        {children}
                    </CountryProvider>
                </CurrencyProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
