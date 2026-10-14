// core/context/language/Language.hydrator.ts
import { getLanguageSetters } from './Language.context';
import { preferenceStorage } from '@/core/utils/storage';
import type { LanguageContextShape } from '../types';

export const languageHydrator = {
    /**
     * Hydrate language from server data
     *
     * If authenticated (isAuthenticated=true):
     *   - Always apply server values (user preferences override localStorage)
     *
     * If unauthenticated (isAuthenticated=false):
     *   - Only set if not already in localStorage (preserve user's local choice)
     */
    hydrate( data: Partial<LanguageContextShape>, isAuthenticated: boolean = false )
    {
        const { setCurrent } = getLanguageSetters();

        if( isAuthenticated )
        {
            // Authenticated: always apply server values
            if( data.current !== undefined ) setCurrent?.( data.current );
        }
        else
        {
            // Unauthenticated: only set if not in localStorage
            if( data.current !== undefined && !preferenceStorage.has( 'language:current' ) )
            {
                setCurrent?.( data.current );
            }
        }
    }
} as const;
