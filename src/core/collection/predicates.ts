/**
 * Search, A–Z indexing and named filters as pure row tests.
 */

import { getPath } from '@/core/utils';
import type { CollectionField, Predicate } from './collection.types';

/** Bucket for rows whose indexed value does not start with a letter. */
export const NON_ALPHA_INDEX = '#';

const SEARCHABLE_TYPES = new Set( ['text', 'email', 'url'] );

/** A field as the search reads it: a key, and optionally the text to read instead. */
export interface SearchField<TRow>
{
    key: string;
    searchValue?: ( row: TRow ) => string | undefined;
}

/**
 * The fields a free-text search reads. Defaults to textual fields and any field
 * supplying its own text — searching a rating or a bare state id for a typed
 * phrase returns noise, but a field that says what it displays is searchable
 * whatever its stored type.
 */
export function resolveSearchFields<TRow>(
    fields: readonly CollectionField<TRow>[] = [],
    explicit?: readonly string[],
): readonly SearchField<TRow>[]
{
    const toSearchField = ( field: CollectionField<TRow> ): SearchField<TRow> =>
        ( { key: field.key, searchValue: field.searchValue } );

    // Explicit keys choose which fields are searched, not how. A field named here
    // keeps the text it declared; one the config does not describe reads its raw
    // value, which is what a bare key has always meant.
    if( explicit )
    {
        const byKey = new Map( fields.map( field => [field.key, field] ) );
        return explicit.map( key =>
        {
            const field = byKey.get( key );
            return field ? toSearchField( field ) : { key };
        } );
    }

    return fields
        .filter( field => field.searchValue || SEARCHABLE_TYPES.has( field.type ?? 'text' ) )
        .map( toSearchField );
}

/**
 * Case-insensitive substring match. An empty term matches everything.
 *
 * A field declaring `searchValue` is read through it, so a column displaying a
 * translated label is searched by that label rather than the id behind it.
 */
export function matchesSearch<TRow>(
    row: TRow,
    term: string,
    fields: readonly SearchField<TRow>[],
): boolean
{
    const needle = term.trim().toLowerCase();
    if( !needle ) return true;

    return fields.some( field =>
    {
        const value = field.searchValue
            ? field.searchValue( row )
            : getPath( row, field.key );

        return value != null && String( value ).toLowerCase().includes( needle );
    } );
}

/**
 * First-letter match. Anything not starting A–Z lands in the '#' bucket so a
 * numeric or symbol-led name stays reachable.
 */
export function matchesAlphaIndex<TRow>(
    row: TRow,
    letter: string | undefined,
    key: string | undefined,
): boolean
{
    if( !letter || !key ) return true;

    const value = getPath( row, key );
    const initial = String( value ?? '' ).trim().charAt( 0 ).toUpperCase();

    return letter === NON_ALPHA_INDEX
        ? !/[A-Z]/.test( initial )
        : initial === letter.toUpperCase();
}

/** Index letters that would return rows, so the control can disable the rest. */
export function availableAlphaIndexes<TRow>(
    rows: readonly TRow[],
    key: string | undefined,
): Set<string>
{
    const found = new Set<string>();
    if( !key ) return found;

    for( const row of rows )
    {
        const initial = String( getPath( row, key ) ?? '' ).trim().charAt( 0 ).toUpperCase();
        found.add( /[A-Z]/.test( initial ) ? initial : NON_ALPHA_INDEX );
    }

    return found;
}

/** Rows passing every predicate. */
export function applyPredicates<TRow>(
    rows: readonly TRow[],
    predicates: readonly Predicate<TRow>[],
): TRow[]
{
    if( predicates.length === 0 ) return [...rows];
    return rows.filter( row => predicates.every( predicate => predicate( row ) ) );
}
