/**
 * Currency Context
 *
 * Stores the current currency ID only (not full config).
 * Components resolve full currency via useSystemCurrencies() query.
 *
 * - useCurrency() for React components (triggers re-renders)
 * - getCurrencyState() for services/loggers (read-only snapshot)
 * - getCurrencySetters() for hydration (setter refs)
 */

import { createContext, useContext, useState, useLayoutEffect, type ReactNode } from 'react';
import { preferenceStorage } from '@/core/utils/storage';
import type { CurrencyContextShape } from '../types';

// Default state for safety before useLayoutEffect runs
// Empty until hydration supplies one: the value is a uuid, and a currency code standing
// in for one resolves to nothing anywhere it is used.
const DEFAULT_CURRENCY_STATE: CurrencyContextShape = {
    current: '',
};

// Module-scope refs (accessible outside React)
let currencyState: CurrencyContextShape = DEFAULT_CURRENCY_STATE;
let currencySetters: {
    setCurrent?: ( v: string ) => void;
} = {};

// Context value type includes state + setters
interface CurrencyContextValue extends CurrencyContextShape
{
    setCurrent: ( v: string ) => void;
}

const CurrencyContext = createContext<CurrencyContextValue>( null! );

/**
 * Currency Provider
 * Initializes from localStorage or USD default.
 * Updates module-scope refs via useLayoutEffect.
 * Persists changes to localStorage via setters.
 */
export function CurrencyProvider( { children }: { children: ReactNode } )
{
    const [current, setCurrentState] = useState<string>( () =>
        preferenceStorage.get<string>( 'currency:current', '' )
    );

    // Wrapped setter that persists to localStorage
    const setCurrent = ( v: string ) => 
    {
        setCurrentState( v );
        preferenceStorage.set( 'currency:current', v );
    };

    // Update refs AFTER render (React rules - no side effects during render)
    useLayoutEffect( () =>
    {
        currencyState = { current };
        currencySetters = { setCurrent };
    } );

    return (
        <CurrencyContext.Provider value={{ current, setCurrent }}>
            {children}
        </CurrencyContext.Provider>
    );
}

/**
 * Hook for React components (triggers re-renders on change)
 */
export const useCurrency = () => useContext( CurrencyContext );

/**
 * Read-only frozen snapshot for outside React (services, loggers)
 * Returns frozen object to prevent accidental mutation
 */
export const getCurrencyState = (): Readonly<CurrencyContextShape> =>
    Object.freeze( { ...currencyState } );

/**
 * Setter refs for hydration
 */
export const getCurrencySetters = () => currencySetters;
