/**
 * formatScaledValue
 *
 * Renders a calculator or measure value for display. The server sends every value as a
 * whole number at its unit's scale — a rate of 250 at scale 10000 is 2.50%, a multiple of
 * 32000 is 3.20×, money is minor units — so the display divides by the scale here and
 * nowhere else.
 *
 * A value that cannot be known (absent) renders as the placeholder, never as 0.
 */

import type { CalculatorUnit } from '../types/calculator.types';

// The scale rates, multiples and statistics are sent at when a descriptor does not say.
const DEFAULT_RATIO_SCALE = 10000;

// Money is sent in minor units of the account's currency.
const MINOR_UNITS_PER_MAJOR = 100;

/**
 * @param value - The value as sent by the server, or undefined when unknown.
 * @param unit - The unit the value is expressed in.
 * @param scale - The integer scale, for rates, multiples and statistics.
 * @param placeholder - What to show for an unknown value.
 * @returns The display string.
 */
export function formatScaledValue(
    value: number | undefined | null,
    unit: CalculatorUnit | undefined,
    scale: number = DEFAULT_RATIO_SCALE,
    placeholder = '—',
): string
{
    if( value === undefined || value === null || Number.isNaN( value ) ) return placeholder;

    switch ( unit )
    {
        case 'rate':
            return `${( value * 100 / scale ).toFixed( 2 )}%`;
        case 'multiple':
            return `${( value / scale ).toFixed( 2 )}×`;
        case 'statistic':
            return ( value / scale ).toFixed( 4 );
        case 'money':
            return ( value / MINOR_UNITS_PER_MAJOR ).toFixed( 2 );
        case 'days':
            return `${value.toLocaleString()} d`;
        default:
            return value.toLocaleString();
    }
}
