// core/context/country/country.hydrator.ts
import { getCountrySetters } from './Country.context';
import { preferenceStorage } from '@/core/utils/storage';
import type { CountryContextShape } from '../types';

export const countryHydrator = {
    /**
     * Hydrate country from server data
     *
     * If authenticated (isAuthenticated=true):
     *   - Always apply server values (user preferences override localStorage)
     *
     * If unauthenticated (isAuthenticated=false):
     *   - Only set if not already in localStorage (preserve user's local choice)
     */
    hydrate( data: Partial<CountryContextShape>, isAuthenticated: boolean = false )
    {
        const { setCurrent } = getCountrySetters();

        if( isAuthenticated )
        {
            // Authenticated: always apply server values
            if( data.current !== undefined ) setCurrent?.( data.current );
        }
        else
        {
            // Unauthenticated: only set if not in localStorage
            if( data.current !== undefined && !preferenceStorage.has( 'country:current' ) )
            {
                setCurrent?.( data.current );
            }
        }
    }
} as const;
