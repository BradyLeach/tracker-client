/**
 * Default Configuration
 *
 * Base configuration for all environments.
 * Merged with environment-specific configs (development.ts, test.ts, production.ts).
 */

import type { UIConfig } from './modules/ui';
import type { LanguageConfig } from './modules/language';
import type { ValidationConfig } from './modules/validation';
import type { APIConfig } from './modules/api';
import type { FeaturesConfig } from './modules/features';
import type { SecurityConfig } from './modules/security';
import type { MonitoringConfig } from './modules/monitoring';

/**
 * Application Configuration Interface
 *
 * Complete application configuration structure.
 * All modules organized under top-level keys.
 */
export interface AppConfig
{
    /** Application environment */
    environment: 'development' | 'staging' | 'production' | 'test';

    /** Language configuration (dates, spelling, direction) */
    language: LanguageConfig;

    /** UI and theme configuration */
    ui: UIConfig;

    /** API connection configuration */
    apiConfig: APIConfig;

    /** Feature flags and developer tools */
    features: FeaturesConfig;

    /** Security rules and settings */
    security: SecurityConfig;

    /** Monitoring and logging configuration */
    monitoring: MonitoringConfig;

    /** Validation rules and constraints */
    validation: ValidationConfig;
}