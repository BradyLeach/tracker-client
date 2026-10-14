/**
 * API Configuration Module
 *
 * API endpoints, base URLs, and connection settings.
 */

export interface APIConfig
{
    /** Base URL for API requests */
    baseUrl: string;

    /** API version prefix */
    version: string;

    /** Request timeout in milliseconds */
    timeout: number;

    /** Maximum number of retry attempts */
    maxRetries: number;
}

/**
 * Default API configuration (all environments)
 * Production values loaded from environment variables
 */
export const apiConfig: APIConfig = {
    baseUrl: '', // Required — must be provided via VITE_API_URL in .env.local
    version: '1.0.0',
    timeout: 30000, // 30 seconds
    maxRetries: 3,
};
