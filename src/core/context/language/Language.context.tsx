/**
 * Language Context
 *
 * Stores current language ID only (not full config).
 * Components resolve full language via useSystemLanguages() query.
 *
 * - useLanguage() for React components (triggers re-renders)
 * - getLanguageState() for services/loggers (read-only snapshot)
 * - getLanguageSetters() for hydration (setter refs)
 *
 * Note: Initializes with empty string. Once query loads, default language ID is set.
 */

import { createContext, useContext, useState, useLayoutEffect, type ReactNode } from 'react';
import { preferenceStorage } from '@/core/utils/storage';
import type { LanguageContextShape } from '../types';

// Default state for safety before useLayoutEffect runs
// Empty until query loads and sets the default language ID
const DEFAULT_LANGUAGE_STATE: LanguageContextShape = {
    current: '', // Will be set once query loads
};

// Module-scope refs (accessible outside React)
let languageState: LanguageContextShape = DEFAULT_LANGUAGE_STATE;
let languageSetters: {
    setCurrent?: ( v: string ) => void;
} = {};

// Context value type includes state + setters
interface LanguageContextValue extends LanguageContextShape
{
    setCurrent: ( v: string ) => void;
}

const LanguageContext = createContext<LanguageContextValue>( null! );

/**
 * Language Provider
 * Initializes from localStorage or empty string.
 * Updates module-scope refs via useLayoutEffect.
 * Persists changes to localStorage via setters.
 */
export function LanguageProvider( { children }: { children: ReactNode } )
{
    const [current, setCurrentState] = useState<string>( () =>
        preferenceStorage.get<string>( 'language:current', '' )
    );

    // Wrapped setter that persists to localStorage
    const setCurrent = ( v: string ) => 
    {
        setCurrentState( v );
        preferenceStorage.set( 'language:current', v );
    };

    // Update refs AFTER render (React rules - no side effects during render)
    useLayoutEffect( () =>
    {
        languageState = { current };
        languageSetters = { setCurrent };
    } );

    return (
        <LanguageContext.Provider value={{ current, setCurrent }}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook for React components (triggers re-renders on change)
 */
export const useLanguage = () => useContext( LanguageContext );

/**
 * Read-only frozen snapshot for outside React (services, loggers)
 * Returns frozen object to prevent accidental mutation
 */
export const getLanguageState = (): Readonly<LanguageContextShape> =>
    Object.freeze( { ...languageState } );

/**
 * Setter refs for hydration
 */
export const getLanguageSetters = () => languageSetters;
