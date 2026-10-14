import type { AppConfig } from './types';
import { uiConfig } from './modules/ui';
import { validationConfig } from './modules/validation';
import { apiConfig } from './modules/api';
import { featuresConfig } from './modules/features';
import { securityConfig } from './modules/security';
import { monitoringConfig } from './modules/monitoring';
import { DEFAULT_LANGUAGE } from './modules/language';

/**
 * Default configuration object (base for all environments)
 */
export const defaultConfig: Partial<AppConfig> = {
    environment: 'development',
    language: DEFAULT_LANGUAGE,
    ui: uiConfig,
    apiConfig: apiConfig,
    features: featuresConfig,
    security: securityConfig,
    monitoring: monitoringConfig,
    validation: validationConfig,
};
