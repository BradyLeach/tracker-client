// core/context/currency/currency.hydrator.ts
import { getCurrencySetters } from './Currency.context';
import { preferenceStorage } from '@/core/utils/storage';
import type { CurrencyContextShape } from '../types';

export const currencyHydrator = {
    /**
     * Hydrate currency from server data
     *
     * If authenticated (isAuthenticated=true):
     *   - Always apply server values (user preferences override localStorage)
     *
     * If unauthenticated (isAuthenticated=false):
     *   - Only set if not already in localStorage (preserve user's local choice)
     */
    hydrate( data: Partial<CurrencyContextShape>, isAuthenticated: boolean = false )
    {
        const { setCurrent } = getCurrencySetters();

        if( isAuthenticated )
        {
            // Authenticated: always apply server values
            if( data.current !== undefined ) setCurrent?.( data.current );
        }
        else
        {
            // Unauthenticated: only set if not in localStorage
            if( data.current !== undefined && !preferenceStorage.has( 'currency:current' ) )
            {
                setCurrent?.( data.current );
            }
        }
    }
} as const;
