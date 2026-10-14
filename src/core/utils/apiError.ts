import type { ApiError } from '@/services/dataService/dataService.types';

/**
 * Creates a typed ApiError object.
 *
 * Centralised factory to ensure all ApiError instances follow
 * a consistent structure across the application.
 *
 * @param key - i18n message key used for translation (e.g., "resource.empty")
 * @param status - HTTP-style status code associated with the error
 * @param details - Optional interpolation variables for i18n messages
 * @returns ApiError
 */
export function apiError(
    key: string,
    details?: Record<string, unknown>
): ApiError
{
    return { key, details };
}

/**
 * Formats an ApiError into a translated string.
 *
 * Accepts a translation function (`t`) so this utility can be used
 * inside React components and outside React (services, bootstrap, CLI).
 *
 * If the error is missing a key, it falls back to "messages.error.unknown".
 *
 * Automatically translates field names in `details.field` using the `fields.*` namespace.
 *
 * @param t - Translation function (i18next `t`)
 * @param error - ApiError object to format
 * @returns Localised error message string
 */
export function formatApiError(
    t: ( key: string, values?: any ) => string,
    error?: ApiError
): string
{
    if( !error?.key )
    {
        return t( 'messages.error.unknown' );
    }

    // Auto-translate field name if present
    const resolvedDetails = { ...error.details };
    if( error.details?.field )
    {
        resolvedDetails.field = t( `fields.${error.details.field}`, error.details.field as string );
    }

    return t( `messages.${error.key}`, resolvedDetails );
}

/**
 * Convenience helper that both:
 * 1. Creates an ApiError object, and
 * 2. Immediately formats it into a translated string.
 *
 * Ideal for service layers or bootstrap code where you want a
 * single-call error message without constructing intermediate objects.
 *
 * @param t - Translation function (i18next `t`)
 * @param key - i18n message key
 * @param status - HTTP-style status code
 * @param details - Optional interpolation variables
 * @returns Formatted, translated error message string
 */
export function apiErrorMessage(
    t: ( key: string, values?: any ) => string,
    key: string,
    details?: Record<string, unknown>
): string
{
    return formatApiError( t, apiError( key, details ) );
}
