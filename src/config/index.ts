/**
 * Configuration System
 *
 * Three-layer merge — matching backend strategy:
 * 1. config/default.ts      — structural defaults (no URLs, no secrets)
 * 2. config/{mode}.ts       — behavioural overrides per environment
 * 3. env vars (always win)  — deployment values from .env.local / .env.{mode}
 *
 * Single access pattern via getConfig(). Immutable after bootstrap.
 */

import { env } from './env';
import { deepMerge, setPath } from '@/core/utils/object';
import type { AppConfig } from '@/../config/types';
import {
    defaultConfig,
    developmentConfig,
    productionConfig,
    testConfig
} from '@/../config';

const environmentMap = {
    development: developmentConfig,
    production: productionConfig,
    test: testConfig,
    staging: developmentConfig
};

/**
 * Singleton config instance
 */
let configInstance: AppConfig | null = null;

/**
 * Apply env var overrides to a config object
 *
 * Only sets a value when the env var is explicitly defined.
 * This lets config/{mode}.ts handle behavioural defaults without being
 * overridden by absent env vars.
 */
function applyEnvOverrides(): Partial<AppConfig>
{
    const overrides: Partial<AppConfig> = {};

    if( env.ENVIRONMENT !== undefined ) setPath( overrides, 'environment', env.ENVIRONMENT );
    if( env.API_URL !== undefined ) setPath( overrides, 'apiConfig.baseUrl', env.API_URL );
    if( env.API_TIMEOUT !== undefined ) setPath( overrides, 'apiConfig.timeout', env.API_TIMEOUT );
    if( env.API_MAX_RETRIES !== undefined ) setPath( overrides, 'apiConfig.maxRetries', env.API_MAX_RETRIES );
    if( env.LOG_LEVEL !== undefined ) setPath( overrides, 'monitoring.logLevel', env.LOG_LEVEL );
    if( env.ENABLE_LOGGING !== undefined ) setPath( overrides, 'monitoring.enableLogging', env.ENABLE_LOGGING );
    if( env.ENABLE_METRICS !== undefined ) setPath( overrides, 'monitoring.enableMetrics', env.ENABLE_METRICS );
    if( env.DEV_TOOLS !== undefined ) setPath( overrides, 'features.devTools', env.DEV_TOOLS );
    if( env.ERROR_REPORTING !== undefined ) setPath( overrides, 'features.errorReporting', env.ERROR_REPORTING );
    if( env.PERF_MONITORING !== undefined ) setPath( overrides, 'features.performanceMonitoring', env.PERF_MONITORING );
    if( env.ENABLE_CSP !== undefined ) setPath( overrides, 'security.enableCSP', env.ENABLE_CSP );

    return overrides;
}

/**
 * Load configuration based on environment
 */
function loadConfig(): AppConfig
{
    const base = { ...defaultConfig } as AppConfig;
    const envOverride = environmentMap[env.ENVIRONMENT ?? 'development'] ?? {};
    const runtimeOverride = applyEnvOverrides();
    return deepMerge( deepMerge( base, envOverride ), runtimeOverride );
}

/**
 * Get the application configuration (singleton)
 *
 * Loads config once and caches it. Immutable after loading.
 *
 * @example
 * import { getConfig } from '@/config';
 * const config = getConfig();
 * const apiUrl = config.apiConfig.baseUrl;
 */
export function getConfig(): Readonly<AppConfig>
{
    if( !configInstance )
    {
        configInstance = loadConfig();
        Object.freeze( configInstance );
    }
    return configInstance;
}

/**
 * Reset configuration (for testing only)
 *
 * Clears the singleton instance to allow reloading.
 * Should only be used in test setup/teardown.
 *
 * @internal
 */
export function resetConfig(): void
{
    configInstance = null;
}

// Export types for consumers
export type { AppConfig } from '@/../config/types';
