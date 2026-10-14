/**
 * The pipeline:
 *
 *     raw rows + collection state → filter → search → A–Z → sort → visibleRows
 *
 * One pure function, no React.
 */

import { buildComparator, sortRows } from './comparators';
import {
    applyPredicates,
    matchesAlphaIndex,
    matchesSearch,
    resolveSearchFields,
} from './predicates';
import type { CollectionFilter, CollectionOptions, CollectionState, Predicate } from './collection.types';

export function runCollection<TRow>(
    rows: readonly TRow[],
    state: CollectionState,
    options: CollectionOptions<TRow> = {},
): TRow[]
{
    const { fields = [], searchKeys, alphaKey, filters = [], sortValues = {} } = options;

    const predicates: Predicate<TRow>[] = [];

    // Filtering runs before sorting: no reason to order rows about to be dropped.
    // Unrecognised keys are ignored so serialisable state outliving a config
    // change still resolves to a usable view.
    const active = state.activeFilterKeys
        .map( key => filters.find( candidate => candidate.key === key ) )
        .filter( ( filter ): filter is CollectionFilter<TRow> => filter !== undefined );

    // Ungrouped filters each narrow on their own. Grouped ones are facets:
    // selections within a facet widen, so "Supplier or Retailer" rather than
    // the usually-empty intersection.
    const facets = new Map<string, Predicate<TRow>[]>();

    for( const filter of active )
    {
        if( filter.group === undefined )
        {
            predicates.push( filter.predicate );
            continue;
        }

        const existing = facets.get( filter.group );
        if( existing ) existing.push( filter.predicate );
        else facets.set( filter.group, [filter.predicate] );
    }

    for( const alternatives of facets.values() )
        predicates.push( row => alternatives.some( predicate => predicate( row ) ) );

    const searchFields = resolveSearchFields<TRow>( fields, searchKeys );
    if( state.search.trim() )
        predicates.push( row => matchesSearch( row, state.search, searchFields ) );

    if( state.alphaIndex )
        predicates.push( row => matchesAlphaIndex( row, state.alphaIndex, alphaKey ) );

    const filtered = applyPredicates( rows, predicates );

    if( !state.sort )
        return filtered;

    return sortRows(
        filtered,
        buildComparator( state.sort.key, state.sort.direction, fields, sortValues ),
    );
}
