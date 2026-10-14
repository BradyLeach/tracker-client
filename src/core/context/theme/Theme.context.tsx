/**
 * Theme Context
 *
 * Runtime theme state initialized from config defaults.
 * - useTheme() for React components (triggers re-renders)
 * - getThemeState() for services/loggers (read-only snapshot)
 * - getThemeSetters() for hydration (setter refs)
 */

import { createContext, useContext, useState, useLayoutEffect, type ReactNode } from 'react';
import { getConfig } from '@/config';
import { preferenceStorage } from '@/core/utils/storage';
import type { ThemeContextShape } from '../types';
import type { ThemeMode, ThemeName, ThemeDirection } from '@/core/utils/constants';

// Default state for safety before useLayoutEffect runs
const { ui } = getConfig();
const DEFAULT_THEME_STATE: ThemeContextShape = {
    mode: ui.activeMode,
    direction: ui.activeDir,
    themeName: ui.activeTheme,
};

// Module-scope refs (accessible outside React)
let themeState: ThemeContextShape = DEFAULT_THEME_STATE;
let themeSetters: {
    setMode?: ( v: ThemeMode ) => void;
    setDirection?: ( v: ThemeDirection ) => void;
    setThemeName?: ( v: ThemeName ) => void;
} = {};

// Context value type includes state + setters
interface ThemeContextValue extends ThemeContextShape
{
    setMode: ( v: ThemeMode ) => void;
    setDirection: ( v: ThemeDirection ) => void;
    setThemeName: ( v: ThemeName ) => void;
}

const ThemeContext = createContext<ThemeContextValue>( null! );

/**
 * Theme Provider
 * Initializes from localStorage (persisted preferences) or config defaults.
 * Updates module-scope refs via useLayoutEffect.
 * Persists changes to localStorage via setters.
 */
export function ThemeProvider( { children }: { children: ReactNode } )
{
    const [mode, setModeState] = useState<ThemeMode>( () =>
        preferenceStorage.get<ThemeMode>( 'theme:mode', ui.activeMode )
    );
    const [direction, setDirectionState] = useState<ThemeDirection>( () =>
        preferenceStorage.get<ThemeDirection>( 'theme:direction', ui.activeDir )
    );
    const [themeName, setThemeNameState] = useState<ThemeName>( () =>
        preferenceStorage.get<ThemeName>( 'theme:name', ui.activeTheme )
    );

    // Wrapped setters that persist to localStorage
    const setMode = ( v: ThemeMode ) => 
    {
        setModeState( v );
        preferenceStorage.set( 'theme:mode', v );
    };

    const setDirection = ( v: ThemeDirection ) => 
    {
        setDirectionState( v );
        preferenceStorage.set( 'theme:direction', v );
    };

    const setThemeName = ( v: ThemeName ) => 
    {
        setThemeNameState( v );
        preferenceStorage.set( 'theme:name', v );
    };

    // Update refs AFTER render (React rules - no side effects during render)
    useLayoutEffect( () =>
    {
        themeState = { mode, direction, themeName };
        themeSetters = { setMode, setDirection, setThemeName };
    } );

    // Update document direction when direction changes
    useLayoutEffect( () =>
    {
        document.dir = direction;
    }, [direction] );

    return (
        <ThemeContext.Provider value={{ mode, direction, themeName, setMode, setDirection, setThemeName }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook for React components (triggers re-renders on change)
 */
export const useTheme = () => useContext( ThemeContext );

/**
 * Read-only frozen snapshot for outside React (services, loggers)
 * Returns frozen object to prevent accidental mutation
 */
export const getThemeState = (): Readonly<ThemeContextShape> =>
    Object.freeze( { ...themeState } );

/**
 * Setter refs for hydration
 */
export const getThemeSetters = () => themeSetters;
