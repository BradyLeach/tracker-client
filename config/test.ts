/**
 * Test Environment Configuration
 *
 * Configuration overrides for test environment (Jest, Vitest, etc.).
 * Merged with default.ts configuration.
 */

import type { AppConfig } from './types';

/**
 * Test-specific configuration overrides
 */
export const testConfig: Partial<AppConfig> = {
    environment: 'test',

    apiConfig: {
        baseUrl: '', // Tests mock VITE_API_URL via tests/setup.ts
        version: '1.0.0-test',
        timeout: 5000, // Shorter timeout for tests
        maxRetries: 0, // No retries in tests
    },

    features: {
        devTools: false,
        errorReporting: false,
        performanceMonitoring: false,
    },

    monitoring: {
        enableLogging: false, // Quiet tests by default
        logLevel: 'error',
        enableMetrics: false,
    },

    security: {
        enableCSP: false,
        apiTimeout: 5000,
        maxRetries: 0,
    },
};
