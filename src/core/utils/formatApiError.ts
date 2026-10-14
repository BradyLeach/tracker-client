import type { ApiError } from '@/services/dataService/dataService.types';

/**
 * Formats an ApiError into a localized string using i18n.
 * Falls back gracefully if details or keys are missing.
 */
export function formatApiError( t: ( key: string, values?: any ) => string, error?: ApiError ): string
{
    if( !error?.key )
    {
        return t( 'messages.error.unknown' );
    }

    return t( `messages.${error.key}`, error.details );
}