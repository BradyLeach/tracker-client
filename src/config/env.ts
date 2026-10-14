/**
 * Environment Variables
 *
 * The ONLY file that reads import.meta.env.
 * Values come from Vite's native .env file loading — no custom injection needed.
 *
 * Layer priority (highest wins):
 *   .env.local          — machine secrets, gitignored
 *   .env.{mode}.local   — machine secrets per mode, gitignored
 *   .env.{mode}         — committed, mode-specific (e.g. VITE_ENVIRONMENT)
 *   .env                — committed base defaults (e.g. VITE_APP_VERSION)
 */

const raw = import.meta.env;

export const env = {
    ENVIRONMENT: raw.VITE_ENVIRONMENT as 'development' | 'staging' | 'production' | 'test' | undefined,
    API_URL:     raw.VITE_API_URL as string | undefined,
    API_TIMEOUT: raw.VITE_API_TIMEOUT
        ? Number( raw.VITE_API_TIMEOUT )
        : undefined,
    API_MAX_RETRIES: raw.VITE_API_MAX_RETRIES
        ? Number( raw.VITE_API_MAX_RETRIES )
        : undefined,
    LOG_LEVEL: raw.VITE_LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' | undefined,
    ENABLE_LOGGING: raw.VITE_ENABLE_LOGGING !== undefined
        ? raw.VITE_ENABLE_LOGGING === 'true'
        : undefined,
    ENABLE_METRICS: raw.VITE_ENABLE_METRICS !== undefined
        ? raw.VITE_ENABLE_METRICS === 'true'
        : undefined,
    DEV_TOOLS: raw.VITE_DEV_TOOLS !== undefined
        ? raw.VITE_DEV_TOOLS === 'true'
        : undefined,
    ERROR_REPORTING: raw.VITE_ERROR_REPORTING !== undefined
        ? raw.VITE_ERROR_REPORTING === 'true'
        : undefined,
    PERF_MONITORING: raw.VITE_PERF_MONITORING !== undefined
        ? raw.VITE_PERF_MONITORING === 'true'
        : undefined,
    ENABLE_CSP: raw.VITE_ENABLE_CSP !== undefined
        ? raw.VITE_ENABLE_CSP === 'true'
        : undefined,
    APP_VERSION: raw.VITE_APP_VERSION as string | undefined,
};
