/**
 * Grouping. Rows become group records here, then the group records are just
 * another collection for the same pipeline to order.
 */

import { getPath } from '@/core/utils';
import type { CollectionField, SortValue } from './collection.types';

/** A set of rows sharing a group key, with the label to display for them. */
export interface CollectionGroup<TRow>
{
    key: string;
    label: string;
    rows: TRow[];
}

/**
 * Sort key for the group's own label column. A real field on the group record,
 * so the pipeline needs no special case for it.
 */
export const GROUP_LABEL_KEY = 'label';

/** Field config letting the pipeline sort groups by their label. */
export const GROUP_LABEL_FIELD: CollectionField = { key: GROUP_LABEL_KEY, type: 'text' };

/**
 * Partitions rows by a key, preserving first-seen order — that order is the
 * collection's natural order, which a cleared sort returns to.
 */
export function groupRows<TRow>(
    rows: readonly TRow[],
    groupBy: string,
    label?: ( rows: TRow[], groupKey: string ) => string,
): CollectionGroup<TRow>[]
{
    const byKey = new Map<string, TRow[]>();

    for( const row of rows )
    {
        const key = String( getPath( row, groupBy ) ?? '' );
        const existing = byKey.get( key );
        if( existing ) existing.push( row );
        else byKey.set( key, [row] );
    }

    return Array.from( byKey, ( [key, groupRowsForKey] ) => ( {
        key,
        label: label?.( groupRowsForKey, key ) ?? key,
        rows: groupRowsForKey,
    } ) );
}

/**
 * Sort values for group columns backed by a rollup, keyed as the column is.
 *
 * Takes rollups structurally — only `value` is read — so the collection layer
 * stays free of rendering types.
 */
export function rollupSortValues<TRow>(
    rollups: Record<string, ( rows: TRow[], groupKey: string ) => { value: string | number }> = {},
): Record<string, SortValue<CollectionGroup<TRow>>>
{
    return Object.fromEntries(
        Object.entries( rollups ).map( ( [key, rollup] ) =>
            [key, ( group: CollectionGroup<TRow> ) => rollup( group.rows, group.key ).value],
        ),
    );
}
