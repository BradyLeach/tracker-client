/**
 * Country Context
 *
 * Stores the current country ID only (not full config).
 * Components resolve the full country from the entity store via useCountries().
 *
 * - useCountry() for React components (triggers re-renders)
 * - getCountryState() for services/loggers (read-only snapshot)
 * - getCountrySetters() for hydration (setter refs)
 */

import { createContext, useContext, useState, useLayoutEffect, type ReactNode } from 'react';
import { preferenceStorage } from '@/core/utils/storage';
import type { CountryContextShape } from '../types';

// Default state for safety before useLayoutEffect runs.
// Empty until the IP-based defaults land or a stored preference is read: the value is a
// uuid, and a country code standing in for one resolves to nothing anywhere it is used.
const DEFAULT_COUNTRY_STATE: CountryContextShape = {
    current: '',
};

// Module-scope refs (accessible outside React)
let countryState: CountryContextShape = DEFAULT_COUNTRY_STATE;
let countrySetters: {
    setCurrent?: ( v: string ) => void;
} = {};

// Context value type includes state + setters
interface CountryContextValue extends CountryContextShape
{
    setCurrent: ( v: string ) => void;
}

const CountryContext = createContext<CountryContextValue>( null! );

/**
 * Country Provider
 * Initializes from localStorage, empty until hydration supplies a country ID.
 * Updates module-scope refs via useLayoutEffect.
 * Persists changes to localStorage via setters.
 */
export function CountryProvider( { children }: { children: ReactNode } )
{
    const [current, setCurrentState] = useState<string>( () =>
        preferenceStorage.get<string>( 'country:current', '' )
    );

    // Wrapped setter that persists to localStorage
    const setCurrent = ( v: string ) => 
    {
        setCurrentState( v );
        preferenceStorage.set( 'country:current', v );
    };

    // Update refs AFTER render (React rules - no side effects during render)
    useLayoutEffect( () =>
    {
        countryState = { current };
        countrySetters = { setCurrent };
    } );

    return (
        <CountryContext.Provider value={{ current, setCurrent }}>
            {children}
        </CountryContext.Provider>
    );
}

/**
 * Hook for React components (triggers re-renders on change)
 */
export const useCountry = () => useContext( CountryContext );

/**
 * Read-only frozen snapshot for outside React (services, loggers)
 * Returns frozen object to prevent accidental mutation
 */
export const getCountryState = (): Readonly<CountryContextShape> =>
    Object.freeze( { ...countryState } );

/**
 * Setter refs for hydration
 */
export const getCountrySetters = () => countrySetters;
