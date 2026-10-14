/**
 * Security Configuration Module
 *
 * Security rules, CSP, and authentication settings.
 */

export interface SecurityConfig
{
    /** Enable Content Security Rule */
    enableCSP: boolean;

    /** API request timeout (milliseconds) */
    apiTimeout: number;

    /** Maximum retry attempts for failed requests */
    maxRetries: number;
}

/**
 * Default security configuration (all environments)
 * Hardened in production environment
 */
export const securityConfig: SecurityConfig = {
    enableCSP: false,
    apiTimeout: 30000, // 30 seconds
    maxRetries: 3,
};
