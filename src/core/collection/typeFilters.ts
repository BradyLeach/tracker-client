/**
 * Facets built from a system type.
 *
 * A collection filtered by a type repeats the same five steps every time: take
 * the ids present in the data, resolve each to its registry label, drop the ones
 * that do not resolve, order them by label, and pair a predicate with an option.
 *
 * Only the matching differs — a formula holds its type directly, a company
 * matches through its partnerships — so the predicate is supplied and the rest
 * lives here.
 */

import type { TypeCatalogue } from '@/domains/system/types/systemType.types';
import type { CollectionFilter } from './collection.types';

/** One toggleable option and the test behind it. */
export interface TypeFacet<TRow>
{
    filters: CollectionFilter<TRow>[];
    options: { key: string; label: string }[];
}

export interface TypeFacetOptions<TRow>
{
    /** System type model, e.g. 'productionType'. Keys the filter group and the labels. */
    model: string;
    /** The type ids present in the data. Duplicates and blanks are fine. */
    presentIds: readonly ( string | undefined )[];
    /** Whether a row belongs under this type id. */
    matches: ( row: TRow, typeId: string ) => boolean;
    /** Where the labels resolve: the live catalogue in the app, a mock one in a playground. */
    catalogue: TypeCatalogue;
}

/**
 * Options come from the ids the data actually holds, so the menu never offers a
 * type that would empty the list, and an id the registry cannot resolve is left
 * out rather than shown as a uuid.
 */
export function buildTypeFacet<TRow>( { model, presentIds, matches, catalogue }: TypeFacetOptions<TRow> ): TypeFacet<TRow>
{
    const entries = [...new Set( presentIds )]
        .filter( ( id ): id is string => !!id )
        .map( id => ( { id, label: catalogue.getLabel( id ) ?? '' } ) )
        .filter( entry => entry.label )
        .sort( ( a, b ) => a.label.localeCompare( b.label ) );

    return {
        filters: entries.map( ( { id } ) => ( {
            key: `${model}:${id}`,
            group: model,
            predicate: ( row: TRow ) => matches( row, id ),
        } ) ),
        options: entries.map( ( { id, label } ) => ( {
            key: `${model}:${id}`,
            label: `types.${model}.${label}`,
        } ) ),
    };
}
