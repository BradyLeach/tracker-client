// core/context/theme/Theme.hydrator.ts
import { getThemeSetters } from './Theme.context';
import { preferenceStorage } from '@/core/utils/storage';
import type { ThemeContextShape } from '../types';

export const themeHydrator = {
    /**
     * Hydrate theme from server data
     *
     * If authenticated (isAuthenticated=true):
     *   - Always apply server values (user preferences override localStorage)
     *
     * If unauthenticated (isAuthenticated=false):
     *   - Only set if not already in localStorage (preserve user's local choice)
     */
    hydrate( data: Partial<ThemeContextShape>, isAuthenticated: boolean = false )
    {
        const { setMode, setDirection, setThemeName } = getThemeSetters();

        if( isAuthenticated )
        {
            // Authenticated: always apply server values
            if( data.mode !== undefined ) setMode?.( data.mode );
            if( data.direction !== undefined ) setDirection?.( data.direction );
            if( data.themeName !== undefined ) setThemeName?.( data.themeName );
        }
        else
        {
            // Unauthenticated: only set if not in localStorage
            if( data.mode !== undefined && !preferenceStorage.has( 'theme:mode' ) )
            {
                setMode?.( data.mode );
            }

            if( data.direction !== undefined && !preferenceStorage.has( 'theme:direction' ) )
            {
                setDirection?.( data.direction );
            }

            if( data.themeName !== undefined && !preferenceStorage.has( 'theme:name' ) )
            {
                setThemeName?.( data.themeName );
            }
        }
    }
} as const;
