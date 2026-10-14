/**
 * Sorting as a data operation. Pure functions over rows and field config.
 */

import { getPath } from '@/core/utils';
import type {
    CollectionField,
    Comparator,
    SortDirection,
    SortValue,
    ValueType,
} from './collection.types';

/**
 * Ranks a pair by presence alone, or undefined when both are present.
 *
 * Separate from the value comparison because the direction multiplier must not
 * apply to it: missing data belongs last in both directions.
 */
export function rankByPresence( a: unknown, b: unknown ): number | undefined
{
    if( a == null && b == null ) return 0;
    if( a == null ) return 1;
    if( b == null ) return -1;
    return undefined;
}

/** Orders two present values of a given semantic type. */
export function compareValues( a: unknown, b: unknown, type: ValueType = 'text' ): number
{
    const byPresence = rankByPresence( a, b );
    if( byPresence !== undefined ) return byPresence;

    switch ( type )
    {
        case 'number':
        case 'rating':
            return Number( a ) - Number( b );

        case 'date':
            return new Date( a as string ).getTime() - new Date( b as string ).getTime();

        default:
            // Selector-derived values carry no declared type.
            if( typeof a === 'number' && typeof b === 'number' ) return a - b;
            return String( a ).localeCompare( String( b ) );
    }
}

/**
 * Build the comparator for a sort key.
 *
 * Resolution order: a value selector for the key, then the field's declared
 * type. Returns undefined when the key is neither, leaving the collection in
 * its natural order rather than sorting by something that does not exist.
 */
export function buildComparator<TRow>(
    key: string,
    direction: SortDirection,
    fields: readonly CollectionField<TRow>[] = [],
    sortValues: Readonly<Record<string, SortValue<TRow>>> = {},
): Comparator<TRow> | undefined
{
    const select = sortValues[key];
    const field = fields.find( f => f.key === key );

    if( !select && !field ) return undefined;

    const multiplier = direction === 'asc' ? 1 : -1;
    const read = select ?? ( ( row: TRow ) => getPath( row, key ) );

    return ( a, b ) =>
    {
        const left = read( a );
        const right = read( b );

        const byPresence = rankByPresence( left, right );
        if( byPresence !== undefined ) return byPresence;

        return multiplier * compareValues( left, right, field?.type );
    };
}

/** Sorts without mutating the input. */
export function sortRows<TRow>( rows: readonly TRow[], comparator?: Comparator<TRow> ): TRow[]
{
    return comparator ? [...rows].sort( comparator ) : [...rows];
}
