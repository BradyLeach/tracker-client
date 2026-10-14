/**
 * usePublicCountries Hook
 *
 * The country catalog as an unauthenticated visitor can read it.
 *
 * Registration is the only caller: a visitor states the jurisdiction their account is
 * bound to before they have one, so this cannot come from the store — that is opened per
 * profile, from model definitions the public whitelist does not serve.
 *
 * Service owns the fetch, hook owns loading and error state. Same shape as
 * useContextDefaults, which is the pre-auth pattern: fresh per mount, no cache layer.
 */

import { useState, useEffect } from 'react';
import { referenceService } from '../services/reference.service';
import type { SystemCountry } from '../types/reference.types';
import type { ApiError } from '@/services/dataService/dataService.types';

export interface PublicCountries
{
    data: SystemCountry[] | undefined;
    isLoading: boolean;
    error: ApiError | undefined;
}

export function usePublicCountries(): PublicCountries
{
    const [data, setData] = useState<SystemCountry[] | undefined>( undefined );
    const [isLoading, setIsLoading] = useState( true );
    const [error, setError] = useState<ApiError | undefined>( undefined );

    useEffect( () =>
    {
        let cancelled = false;

        async function load()
        {
            const response = await referenceService.getPublicCountries();

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
