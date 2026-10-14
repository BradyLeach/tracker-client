/**
 * Context Defaults Service
 *
 * The IP-based suggestions an unauthenticated visitor is served: which country, language
 * and currency to assume before they have told us anything.
 *
 * The catalogs behind the login boundary are not here — those are entity records in the
 * store (geo.service.ts). What is here is the pre-auth pair the store cannot serve:
 * countries for the registration form, languages for I18nSync.
 *
 * Every read on this service uses `dataService.get`, which is a direct call with no
 * caching. Pre-auth data is fetched once per mount by a hook that owns its own state, the
 * same way useContextDefaults does.
 */

import { dataService } from '@/services/dataService/dataService';
import type { ApiResponse } from '@/services/dataService/dataService.types';
import type { SystemCountry, SystemLanguage } from '../types/reference.types';

export interface ContextDefaultsResponse
{
    countryId?: string; // UUID
    languageId?: string; // UUID
    currencyId?: string; // UUID
    themeMode?: 'light' | 'dark';
    themeName?: string;
}

export const referenceService = {
    /**
     * Get the public country catalog
     * Endpoint: GET /system/controllers/countries
     *
     * The registration form's only source of countries: a visitor states the jurisdiction
     * their account is bound to before they have one, so this cannot come from the store.
     *
     * Projected to id, code and label. Never shredded — a projected record would overwrite
     * the whole one the store holds after login.
     *
     * @returns ApiResponse containing array of SystemCountry
     */
    async getPublicCountries(): Promise<ApiResponse<SystemCountry[]>>
    {
        return await dataService.get<SystemCountry[]>( 'system/controllers/countries' );
    },

    /**
     * Get the public language catalog
     * Endpoint: GET /system/controllers/languages
     *
     * I18nSync resolves a language id to a locale on the marketing and login pages, before
     * any store exists. Detecting a visitor's language from their IP and rendering in it is
     * the point, so this stays a public read.
     *
     * Projected, and never shredded, for the same reason as countries.
     *
     * @returns ApiResponse containing array of SystemLanguage
     */
    async getPublicLanguages(): Promise<ApiResponse<SystemLanguage[]>>
    {
        return await dataService.get<SystemLanguage[]>( 'system/controllers/languages' );
    },

    /**
     * Get context defaults (IP-based suggestions)
     * Endpoint: GET /system/context/defaults
     *
     * Returns transient defaults based on caller IP geolocation.
     * Not cached—fresh on each request.
     *
     * @returns ApiResponse containing default country/language/currency codes
     */
    async getContextDefaults(): Promise<ApiResponse<ContextDefaultsResponse>>
    {
        return await dataService.get<ContextDefaultsResponse>( 'system/controllers/context/defaults' );
    }
};
