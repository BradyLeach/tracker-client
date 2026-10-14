/**
 * Collection types
 *
 * Shared vocabulary for search, filtering, A–Z indexing and sorting,
 * expressed without reference to any renderer.
 */

/**
 * Semantic type of a value. Selects a comparator here and a cell renderer in
 * the table layer — `TableColumnType` is an alias of this, so they cannot drift.
 */
export type ValueType =
    | 'text'
    | 'email'
    | 'url'
    | 'number'
    | 'boolean'
    | 'date'
    | 'enum'
    | 'rating'
    | 'state';

/**
 * The minimum a field must declare to be sorted or searched.
 * `TableColumnConfig` satisfies this structurally, so a page passes its
 * existing column config straight through.
 */
export interface CollectionField<TRow = unknown>
{
    /** Field key. Dot-notation is resolved, e.g. 'currentState.name'. */
    key: string;
    /** Defaults to text. */
    type?: ValueType;
    /**
     * The text a free-text search reads, for a field whose stored value is not
     * what the user sees — a type id shown as a translated label, or a column
     * with no stored value at all.
     *
     * Without it the search reads the raw value, so typing a production method
     * searches its uuid and matches nothing.
     */
    searchValue?: ( row: TRow ) => string | undefined;
}

export type SortDirection = 'asc' | 'desc';

export interface CollectionSort
{
    key: string;
    direction: SortDirection;
}

/** A row test. Pure — no React, no side effects. */
export type Predicate<TRow> = ( row: TRow ) => boolean;

/** Compares two rows. Negative, zero or positive, as Array.sort expects. */
export type Comparator<TRow> = ( a: TRow, b: TRow ) => number;

/**
 * Derives the value a sort key orders by, for keys that are not plain fields.
 *
 * A value selector rather than a comparator, so the pipeline can rank missing
 * values outside the direction multiplier. Given a comparator it cannot see
 * the value, and "missing last" would invert on a descending sort.
 */
export type SortValue<TRow> = ( row: TRow ) => unknown;

/** A named, toggleable filter. The key is what state holds, not the predicate. */
export interface CollectionFilter<TRow>
{
    key: string;
    predicate: Predicate<TRow>;
    /**
     * Facet this filter belongs to. Filters sharing a group are OR'd; groups
     * are AND'd with each other and with ungrouped filters.
     *
     * Ticking two partnership types means "either type", not "both" — the
     * intersection is usually empty and reads as a broken list. Leave undefined
     * for a standalone filter such as a status toggle.
     */
    group?: string;
}

/**
 * Everything the user has asked for. Serialisable by design — no functions —
 * so it can come from a URL or a saved view.
 */
export interface CollectionState
{
    search: string;
    sort?: CollectionSort;
    /** Uppercase letter, or '#' for non-alphabetic. Undefined shows all. */
    alphaIndex?: string;
    /**
     * A key with no matching filter is ignored rather than treated as an error,
     * so state that outlives a config change still resolves to a usable view.
     */
    activeFilterKeys: string[];
    /** Current page, 1-based. Ignored when no `pageSize` is configured. */
    page: number;
}

/** How a given collection behaves. Supplied by the page; constant per page. */
export interface CollectionOptions<TRow>
{
    /** Field definitions. Pass the page's existing table column config. */
    fields?: readonly CollectionField<TRow>[];
    /** Keys searched by the free-text term. Defaults to the textual fields. */
    searchKeys?: readonly string[];
    /** Key the A–Z index reads. Required for alpha filtering to do anything. */
    alphaKey?: string;
    filters?: readonly CollectionFilter<TRow>[];
    /**
     * Value selectors for sort keys that are not plain fields — a computed
     * column, or one whose sort order differs from its stored value.
     * Consulted before `fields`.
     */
    sortValues?: Readonly<Record<string, SortValue<TRow>>>;
    /**
     * Rows per page. Omit for an unpaginated collection — `visibleRows` is
     * then the whole processed set.
     */
    pageSize?: number;
    initialState?: Partial<CollectionState>;
}

/** Everything shown, natural order. */
export const EMPTY_COLLECTION_STATE: CollectionState = {
    search: '',
    sort: undefined,
    alphaIndex: undefined,
    activeFilterKeys: [],
    page: 1,
};
