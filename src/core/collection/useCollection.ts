/**
 * useCollection
 *
 * Owns collection state and derives `visibleRows` from it. Renderer-independent:
 * it returns rows and the handlers a control needs to report intent.
 *
 * `visibleRows` is never stored in state — a copy in `useState` is a second
 * source of truth that goes stale when a query refetches.
 *
 * @example
 * ```tsx
 * const collection = useCollection( companies, { fields: config.columns, alphaKey: 'name' } );
 *
 * <DataTable
 *     rows={collection.visibleRows}
 *     sortKey={collection.sortKey}
 *     sortDir={collection.sortDir}
 *     onSortChange={collection.toggleSort}
 * />
 * ```
 */

import { useCallback, useMemo, useState } from 'react';
import { runCollection } from './runCollection';
import { availableAlphaIndexes } from './predicates';
import { clampPage, pageCountOf, paginate } from './pagination';
import { EMPTY_COLLECTION_STATE } from './collection.types';
import type {
    CollectionOptions,
    CollectionState,
    SortDirection,
} from './collection.types';

export interface UseCollectionResult<TRow>
{
    /**
     * The rows to render — the current page when `pageSize` is set, otherwise
     * the whole processed set. Hand straight to any renderer.
     */
    visibleRows: TRow[];

    /** Processed rows before paging. The "of 42" in a page indicator. */
    totalCount: number;
    /** Current page, 1-based. */
    page: number;
    pageCount: number;
    pageSize?: number;
    setPage: ( page: number ) => void;

    /** The full state, for callers that persist or share a view. */
    state: CollectionState;

    sortKey?: string;
    sortDir: SortDirection;
    /**
     * Re-reporting the active key flips direction; a third press clears the
     * sort, so the natural order stays reachable.
     */
    toggleSort: ( key: string ) => void;

    search: string;
    setSearch: ( term: string ) => void;

    alphaIndex?: string;
    /** Passing the active letter clears it. */
    setAlphaIndex: ( letter: string | undefined ) => void;
    /** Letters that would return rows, for disabling dead entries in the index. */
    availableAlphaIndexes: Set<string>;

    activeFilterKeys: string[];
    isFilterActive: ( key: string ) => boolean;
    toggleFilter: ( key: string ) => void;
    setFilters: ( keys: string[] ) => void;

    reset: () => void;
}

export function useCollection<TRow>(
    rows: readonly TRow[],
    options: CollectionOptions<TRow> = {},
): UseCollectionResult<TRow>
{
    const { fields, searchKeys, alphaKey, filters, sortValues, pageSize, initialState } = options;

    const [state, setState] = useState<CollectionState>( () => ( {
        ...EMPTY_COLLECTION_STATE,
        ...initialState,
    } ) );

    // Depends on the option fields, not the options object, which most call
    // sites rebuild every render.
    const processedRows = useMemo(
        () => runCollection( rows, state, { fields, searchKeys, alphaKey, filters, sortValues } ),
        [rows, state, fields, searchKeys, alphaKey, filters, sortValues],
    );

    // Clamped rather than stored: a filter can shrink the collection under the
    // page you were on, and a stored page would strand the view on an empty one.
    const page = clampPage( state.page, processedRows.length, pageSize );

    const visibleRows = useMemo(
        () => paginate( processedRows, page, pageSize ),
        [processedRows, page, pageSize],
    );

    // From the raw rows, so a letter stays reachable while another is selected.
    const alphaIndexes = useMemo(
        () => availableAlphaIndexes( rows, alphaKey ),
        [rows, alphaKey],
    );

    // Every view change returns to page 1. Staying on page 3 after a search
    // shows an arbitrary slice of a set the user has just redefined.
    const toggleSort = useCallback( ( key: string ) =>
    {
        setState( previous =>
        {
            if( previous.sort?.key !== key )
                return { ...previous, page: 1, sort: { key, direction: 'asc' } };

            if( previous.sort.direction === 'asc' )
                return { ...previous, page: 1, sort: { key, direction: 'desc' } };

            return { ...previous, page: 1, sort: undefined };
        } );
    }, [] );

    const setSearch = useCallback( ( term: string ) =>
        setState( previous => ( { ...previous, page: 1, search: term } ) ), [] );

    const setAlphaIndex = useCallback( ( letter: string | undefined ) =>
        setState( previous => ( {
            ...previous,
            page: 1,
            alphaIndex: previous.alphaIndex === letter ? undefined : letter,
        } ) ), [] );

    const toggleFilter = useCallback( ( key: string ) =>
        setState( previous => ( {
            ...previous,
            page: 1,
            activeFilterKeys: previous.activeFilterKeys.includes( key )
                ? previous.activeFilterKeys.filter( active => active !== key )
                : [...previous.activeFilterKeys, key],
        } ) ), [] );

    const setFilters = useCallback( ( keys: string[] ) =>
        setState( previous => ( { ...previous, page: 1, activeFilterKeys: keys } ) ), [] );

    const setPage = useCallback( ( next: number ) =>
        setState( previous => ( { ...previous, page: Math.max( 1, next ) } ) ), [] );

    const reset = useCallback( () =>
        setState( { ...EMPTY_COLLECTION_STATE, ...initialState } ), [initialState] );

    const isFilterActive = useCallback(
        ( key: string ) => state.activeFilterKeys.includes( key ),
        [state.activeFilterKeys],
    );

    return {
        visibleRows,
        totalCount: processedRows.length,
        page,
        pageCount: pageCountOf( processedRows.length, pageSize ),
        pageSize,
        setPage,
        state,
        sortKey: state.sort?.key,
        sortDir: state.sort?.direction ?? 'asc',
        toggleSort,
        search: state.search,
        setSearch,
        alphaIndex: state.alphaIndex,
        setAlphaIndex,
        availableAlphaIndexes: alphaIndexes,
        activeFilterKeys: state.activeFilterKeys,
        isFilterActive,
        toggleFilter,
        setFilters,
        reset,
    };
}
