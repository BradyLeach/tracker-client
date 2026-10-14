/**
 * useContextDefaults Hook
 *
 * Manages lifecycle for transient context defaults (IP-based suggestions).
 * Service owns fetch (no cache—fresh per mount), hook manages loading/error state.
 *
 * Separated from reference data hooks to keep concerns clean:
 * - Reference data: cached, stable, menu options
 * - Defaults: fresh per mount, ephemeral, suggested by IP
 */

import { useState, useEffect } from 'react';
import { referenceService, type ContextDefaultsResponse } from '../services/reference.service';
import type { ApiResponse } from '@/services/dataService/dataService.types';

export interface ContextDefaults
{
    defaultCountryId?: string; // UUID for hydration
    defaultLanguageId?: string; // UUID for hydration
    defaultCurrencyId?: string; // UUID for hydration
    defaultThemeMode?: 'light' | 'dark';
    defaultThemeName?: string;
    isLoading: boolean;
    error: any;
}

export function useContextDefaults(): ContextDefaults
{
    const [defaultCountryId, setDefaultCountryId] = useState<string | undefined>( undefined );
    const [defaultLanguageId, setDefaultLanguageId] = useState<string | undefined>( undefined );
    const [defaultCurrencyId, setDefaultCurrencyId] = useState<string | undefined>( undefined );
    const [defaultThemeMode, setDefaultThemeMode] = useState<'light' | 'dark' | undefined>( undefined );
    const [defaultThemeName, setDefaultThemeName] = useState<string | undefined>( undefined );
    const [isLoading, setIsLoading] = useState( true );
    const [error, setError] = useState<any>( null );

    useEffect( () =>
    {
        async function load()
        {
            setIsLoading( true );
            setError( null );

            const response = await referenceService.getContextDefaults() as ApiResponse<ContextDefaultsResponse>;

            if( response.error )
            {
                setError( response.error );
            }
            else
            {
                // Safely flatten response—supports partial responses without silent failure
                const { countryId, languageId, currencyId, themeMode, themeName } = response.data ?? {};
                setDefaultCountryId( countryId );
                setDefaultLanguageId( languageId );
                setDefaultCurrencyId( currencyId );
                setDefaultThemeMode( themeMode );
                setDefaultThemeName( themeName );
            }

            setIsLoading( false );
        }

        void load();
    }, [] );

    return {
        defaultCountryId,
        defaultLanguageId,
        defaultCurrencyId,
        defaultThemeMode,
        defaultThemeName,
        isLoading,
        error
    };
}
