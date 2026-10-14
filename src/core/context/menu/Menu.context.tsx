/**
 * Menu Context
 *
 * Runtime menu/navigation state - hydrated from backend post-auth.
 * - useMenu() for React components (triggers re-renders)
 * - getMenuState() for services/loggers (read-only snapshot)
 * - getMenuSetters() for hydration (setter refs)
 */

import { createContext, useContext, useState, useLayoutEffect, type ReactNode } from 'react';
import type { MenuContextShape } from '../types';
import type { SidebarNavItemConfig } from '@/components/configMenu';

// Empty until hydrated post-auth
const EMPTY_NAV_ITEMS: SidebarNavItemConfig[] = [];

// Default state for safety before useLayoutEffect runs
const DEFAULT_MENU_STATE: MenuContextShape = {
    config: EMPTY_NAV_ITEMS,
    collapsed: false,
};

// Module-scope refs (accessible outside React)
let menuState: MenuContextShape = DEFAULT_MENU_STATE;
let menuSetters: {
    setConfig?: ( v: SidebarNavItemConfig[] ) => void;
    setCollapsed?: ( v: boolean ) => void;
} = {};

// Context value type includes state + setters
interface MenuContextValue extends MenuContextShape
{
    setConfig: ( v: SidebarNavItemConfig[] ) => void;
    setCollapsed: ( v: boolean ) => void;
}

const MenuContext = createContext<MenuContextValue>( null! );

/**
 * Menu Provider
 * Initializes with empty config, hydrated from backend post-auth
 */
export function MenuProvider( { children }: { children: ReactNode } )
{
    const [config, setConfig] = useState<SidebarNavItemConfig[]>( EMPTY_NAV_ITEMS );
    const [collapsed, setCollapsed] = useState<boolean>( false );

    // Update refs AFTER render (React rules - no side effects during render)
    useLayoutEffect( () =>
    {
        menuState = { config, collapsed };
        menuSetters = { setConfig, setCollapsed };
    } );

    return (
        <MenuContext.Provider value={{ config, collapsed, setConfig, setCollapsed }}>
            {children}
        </MenuContext.Provider>
    );
}

/**
 * Hook for React components (triggers re-renders on change)
 */
export const useMenu = () => useContext( MenuContext );

/**
 * Read-only frozen snapshot for outside React (services, loggers)
 * Returns frozen object to prevent accidental mutation
 */
export const getMenuState = (): Readonly<MenuContextShape> =>
    Object.freeze( { ...menuState } );

/**
 * Setter refs for hydration
 */
export const getMenuSetters = () => menuSetters;
