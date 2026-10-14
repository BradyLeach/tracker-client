/**
 * Feature Configuration Module
 *
 * Feature flags and developer tools configuration.
 */

export interface FeaturesConfig
{
    /** Enable React DevTools */
    devTools: boolean;

    /** Enable error reporting to external service */
    errorReporting: boolean;

    /** Enable performance monitoring */
    performanceMonitoring: boolean;
}

/**
 * Default features configuration (all environments)
 * Overridden per environment (dev/test/prod)
 */
export const featuresConfig: FeaturesConfig = {
    devTools: false,
    errorReporting: false,
    performanceMonitoring: false,
};
