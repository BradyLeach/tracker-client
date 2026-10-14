/**
 * Date/time Utilities
 *
 * The one place the date library is configured. Callers get plain strings, so
 * swapping the library touches this file only.
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend( relativeTime );

/**
 * Human elapsed time, e.g. "2 days ago".
 *
 * Returns an empty string for a missing or unparseable value rather than
 * "Invalid Date", which would render as content.
 */
export function formatRelativeTime( value: string | number | Date | undefined ): string
{
    if( value === undefined ) return '';

    const parsed = dayjs( value );
    if( !parsed.isValid() ) return '';

    // Server timestamps can sit a second or two ahead of the browser clock,
    // which renders a record just created as "in a few seconds". Anything in
    // the future is reported as now.
    return parsed.isAfter( dayjs() ) ? dayjs().fromNow() : parsed.fromNow();
}

/** Sort key for a timestamp. Missing values sort oldest. */
export function timestampOf( value: string | number | Date | undefined ): number
{
    if( value === undefined ) return 0;

    const parsed = dayjs( value );
    return parsed.isValid() ? parsed.valueOf() : 0;
}
