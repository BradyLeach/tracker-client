/**
 * Development Environment Configuration
 *
 * Configuration overrides for local development.
 * Merged with default.ts configuration.
 */

import type { AppConfig } from './types';

/**
 * Development-specific configuration overrides
 */
export const developmentConfig: Partial<AppConfig> = {
    environment: 'development',

    features: {
        devTools: true,
        errorReporting: false,
        performanceMonitoring: false,
    },

    monitoring: {
        enableLogging: true,
        logLevel: 'info',
        enableMetrics: false,
    },

    security: {
        enableCSP: false,
        apiTimeout: 30000,
        maxRetries: 3,
    },
};
