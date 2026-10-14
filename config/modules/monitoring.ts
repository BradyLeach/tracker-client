import { LOG_LEVEL } from '@/core/utils/constants';

/**
 * Monitoring Configuration Module
 *
 * Logging, metrics, and observability settings.
 */
export interface MonitoringConfig
{
    /** Enable application logging */
    enableLogging: boolean;

    /** Logging level threshold */
    logLevel: typeof LOG_LEVEL[keyof typeof LOG_LEVEL];

    /** Enable metrics collection */
    enableMetrics: boolean;
}

/**
 * Default monitoring configuration (all environments)
 * Log level adjusted per environment
 */
export const monitoringConfig: MonitoringConfig = {
    enableLogging: true,
    logLevel: 'info',
    enableMetrics: false,
};
