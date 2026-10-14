/**
 * React hooks for configuration management
 *
 * Provides access to environment-based application configuration.
 * For business rules and feature flags, use RuleRegistry.
 */

import { useMemo } from 'react';
import { getConfig } from '@/config';
import type { AppConfig } from '@/../config/types';

/**
 * Hook for accessing current application configuration.
 *
 * Configuration is static (loaded from environment variables during bootstrap).
 * Does not re-render on changes (configuration doesn't change at runtime).
 *
 * @returns {AppConfig} Application configuration
 *
 * @example
 * const config = useConfig();
 * const apiUrl = config.api.baseUrl;
 * const theme = config.ui.activeTheme;
 */
export function useConfig(): AppConfig
{
    // Use useMemo to avoid unnecessary re-renders
    // Config is a singleton, but useMemo ensures referential stability
    return useMemo( () => getConfig(), [] );
}

/**
 * Hook for accessing a specific configuration value by path.
 *
 * @param {string} configPath - Dot notation path to config value (e.g., 'security.apiTimeout')
 * @returns {T | undefined} Value at the config path
 *
 * @example
 * const apiTimeout = useConfigValue<number>('security.apiTimeout');
 */
export function useConfigValue<T>( configPath: string ): T | undefined
{
    const config = useConfig();

    const value = useMemo( () =>
    {
        return getNestedValue( config, configPath ) as T;
    }, [config, configPath] );

    return value;
}

/**
 * Utility function to get nested object values using dot notation.
 *
 * @param {any} obj - Object to traverse
 * @param {string} path - Dot-separated path (e.g., 'security.apiTimeout')
 * @returns {unknown} Value at path, or undefined if not found
 */
function getNestedValue( obj: any, path: string ): unknown
{
    return path.split( '.' ).reduce( ( current, key ) => current?.[key], obj );
}