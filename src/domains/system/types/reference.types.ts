/**
 * System Reference Data Types
 *
 * Backend shapes for system-wide reference data.
 * Public, unauthenticated endpoints for populating UI dropdowns/selectors.
 */

/**
 * Language reference from backend
 * Endpoint: GET /system/controllers/languages
 *
 * Example: { id: 'uuid', code: 'en', label: 'English' }
 */
export interface SystemLanguage
{
    id: string;
    code: string;
    label: string;
}

/**
 * Currency reference from backend
 * Endpoint: GET /system/controllers/currencies
 *
 * Example: { id: 'uuid', code: 'USD', symbol: '$', label: 'United States Dollar' }
 */
export interface SystemCurrency
{
    id: string;
    code: string;
    symbol: string;
    label: string;
}

/**
 * Country reference from backend
 * Endpoint: GET /system/controllers/countries
 *
 * Example: { id: 'uuid', code: 'US', label: 'United States' }
 */
export interface SystemCountry
{
    id: string;
    code: string;
    label: string;
}
