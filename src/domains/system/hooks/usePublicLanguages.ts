/**
 * usePublicLanguages Hook
 *
 * The language catalog as an unauthenticated visitor can read it.
 *
 * I18nSync is mounted app-wide and resolves a language id to a locale on the marketing and
 * login pages, before any store exists. Detecting a visitor's language from their IP and
 * rendering in it is the point, so this stays a public read.
 *
 * Service owns the fetch, hook owns loading and error state. Same shape as
 * useContextDefaults, which is the pre-auth pattern: fresh per mount, no cache layer.
 */

import { useState, useEffect } from 'react';
import { referenceService } from '../services/reference.service';
import type { SystemLanguage } from '../types/reference.types';
import type { ApiError } from '@/services/dataService/dataService.types';

export interface PublicLanguages
{
    data: SystemLanguage[] | undefined;
    isLoading: boolean;
    error: ApiError | undefined;
}

export function usePublicLanguages(): PublicLanguages
{
    const [data, setData] = useState<SystemLanguage[] | undefined>( undefined );
    const [isLoading, setIsLoading] = useState( true );
    const [error, setError] = useState<ApiError | undefined>( undefined );

    useEffect( () =>
    {
        let cancelled = false;

        async function load()
        {
            const response = await referenceService.getPublicLanguages();

            if( cancelled ) return;

            if( response.error ) setError( response.error );
            else setData( response.data );

            setIsLoading( false );
        }

        void load();

        return () => { cancelled = true; };
    }, [] );

    return { data, isLoading, error };
}
