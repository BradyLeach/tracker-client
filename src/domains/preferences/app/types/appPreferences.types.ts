/**
 * AppPreferences Types
 *
 * Frontend representation of user app preferences.
 * Stores IDs only—never redefines reference shapes.
 */

import type { LanguageId, CurrencyId, ProfileId } from '@/core/types/ids';

export interface AppPreferences
{
    id: string;
    ownerId: ProfileId;
    themeMode: 'light' | 'dark';
    themeName: string;
    direction: 'ltr' | 'rtl';
    languageId: LanguageId;
    currencyId: CurrencyId;
}

export interface AppPreferencesUpdatePayload
{
    themeMode?: 'light' | 'dark';
    themeName?: string;
    direction?: 'ltr' | 'rtl';
    languageId?: LanguageId;
    currencyId?: CurrencyId;
}
