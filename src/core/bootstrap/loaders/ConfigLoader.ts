/**
 * Configuration Bootstrap Loader
 *
 * Thin wrapper that loads configuration via the centralized config system.
 * Delegates to src/config/index.ts for actual config loading and merging.
 *
 * Responsibilities:
 * - Load config during bootstrap phase
 * - Perform bootstrap-specific validation (HTTPS check, etc.)
 * - Return config to bootstrap context
 *
 * Does NOT:
 * - Parse environment variables (handled by vite.config.ts + src/config/env.ts)
 * - Merge config layers (handled by src/config/index.ts)
 * - Store config instance (handled by getConfig() singleton)
 */

import type { BootstrapLoader } from '../types';
import { logger } from '@/core/utils/logger';
import { getConfig, resetConfig } from '@/config';
import type { AppConfig } from '@/../config/types';

/**
 * Re-export AppConfig type for backward compatibility
 * @deprecated Import from '@/../config/types' instead
 */
export type { AppConfig };

/**
 * ConfigLoader - Bootstrap integration for configuration system
 *
 * Loads application configuration during the bootstrap phase.
 * Delegates actual config loading to the centralized config system.
 */
export class ConfigLoader implements BootstrapLoader<AppConfig>
{
    name = 'config';
    critical = true;

    async load(): Promise<AppConfig>
    {
        // Load config from centralized system
        const config = getConfig();

        // Perform bootstrap-specific validation
        this.validateForBootstrap( config );

        // Log configuration summary
        logger.info( 'Configuration loaded', {
            environment: config.environment,
            apiUrl: config.apiConfig.baseUrl,
            errorReporting: config.features.errorReporting,
            logLevel: config.monitoring.logLevel
        } );

        return config;
    }

    /**
     * Bootstrap-specific validation
     *
     * Validates critical configuration required for app startup.
     * Domain-specific validation should happen at usage points.
     */
    private validateForBootstrap( config: AppConfig ): void
    {
        const errors: string[] = [];

        // Validate API URL exists
        if( !config.apiConfig.baseUrl )
        {
            errors.push( 'API base URL is required' );
        }

        // Security: Ensure HTTPS in production
        if( config.environment === 'production' )
        {
            const isLocalhost = config.apiConfig.baseUrl.includes( 'localhost' ) ||
                config.apiConfig.baseUrl.includes( '127.0.0.1' );

            if( !config.apiConfig.baseUrl.startsWith( 'https://' ) && !isLocalhost )
            {
                errors.push( 'Production environment requires HTTPS API URL' );
            }

            // Warn if error reporting is disabled in production
            if( !config.features.errorReporting )
            {
                logger.warn( 'Error reporting should be enabled in production' );
            }
        }

        // Validate API URL format
        try
        {
            new URL( config.apiConfig.baseUrl );
        }
        catch
        {
            errors.push( `Invalid API URL format: ${config.apiConfig.baseUrl}` );
        }

        // Throw if critical errors found
        if( errors.length > 0 )
        {
            logger.error( 'Bootstrap configuration validation failed', { errors } );
            throw new Error( `Bootstrap configuration validation failed: ${errors.join( ', ' )}` );
        }

        // Log configuration summary (without sensitive data)
        logger.debug( 'Configuration validated for bootstrap', {
            environment: config.environment,
            enabledFeatures: Object.keys( config.features )
                .filter( k => config.features[k as keyof typeof config.features] ),
            securityEnabled: config.security.enableCSP,
            logLevel: config.monitoring.logLevel
        } );
    }
}

/**
 * Test-only function to reset the config singleton state
 *
 * @internal
 * @deprecated Use resetConfig() from '@/config' instead
 */
export function resetForTesting(): void
{
    // Delegate to config system's reset function
    resetConfig();
}