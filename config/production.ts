/**
 * Production Environment Configuration
 *
 * Configuration overrides for production deployment.
 * Merged with default.ts configuration.
 * Most values loaded from environment variables.
 */

import type { AppConfig } from './types';

/**
 * Production-specific configuration overrides
 */
export const productionConfig: Partial<AppConfig> = {
    environment: 'production',

    features: {
        devTools: false,
        errorReporting: true,
        performanceMonitoring: true,
    },

    monitoring: {
        enableLogging: true,
        logLevel: 'error',
        enableMetrics: true,
    },

    security: {
        enableCSP: true,
        apiTimeout: 30000,
        maxRetries: 3,
    },
};
