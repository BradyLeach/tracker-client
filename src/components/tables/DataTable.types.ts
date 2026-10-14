import type { ReactNode } from 'react';
import type { SortDirection, ValueType } from '@/core/collection';
import type { IconKey } from '@/components/ui';

/**
 * Semantic display types for table columns.
 * DataTable uses these to select the default cell renderer
 * when no explicit `render` override is provided.
 *
 * An alias of the collection layer's `ValueType`, not a copy, so a column
 * cannot display as a date and sort as a string.
 */
export type TableColumnType = ValueType;

/**
 * Column definition — the single source of truth for a table column.
 *
 * Produced by TableColumnFactory from backend model definitions.
 * Domain config builders filter, order, and override fields as needed.
 * DataTable consumes these directly — no intermediate translation step.
 */
export interface TableColumnConfig<T = unknown>
{
    /** Field key. Supports dot-notation for nested values (e.g. 'currentState.name'). */
    key: string;
    /** Column header label. Literal string or i18n key. */
    label: string;
    /** Semantic type — drives the default cell renderer. */
    type: TableColumnType;
    /** Column alignment. Defaults to 'left'; factory sets 'right' automatically for number/rating. */
    align?: 'left' | 'right' | 'center';
    /** Fixed column width. */
    width?: string;
    /** Available options for enum columns. Populated by factory from model validation.oneOf. */
    options?: Array<{ value: string | number; label: string }>;
    /** Minimum value for rating columns. Populated by factory from model validation.min. */
    min?: number;
    /** Maximum value for rating columns. Populated by factory from model validation.max. */
    max?: number;
    /**
     * Explicit render override. Takes precedence over the type-based default.
     * Use for hydrated associations, custom formatting, or non-standard display.
     */
    render?: ( row: T ) => ReactNode;
    /**
     * An icon drawn in a tile beside this column's value: the row's own, or the column's
     * generic one. Any column type can carry one. The fallback is required, so a tile is
     * never blank.
     */
    /**
     * How prominently the value reads. `primary` for the column that names the record,
     * `secondary` for supporting detail. Omit for the table's default.
     */
    emphasis?: 'primary' | 'secondary';
    icon?: {
        /** Dot-notation path to the row's icon registry key, e.g. 'locationType.icon'. */
        field: string;
        /** The category's generic icon, drawn when the row's own is missing or unknown. */
        fallback: IconKey;
    };
    /**
     * The text a free-text search reads, when `render` shows something the stored
     * value does not contain — a type id displayed as a label, or a column derived
     * from an association. Read by the collection pipeline, ignored by the table.
     */
    searchValue?: ( row: T ) => string | undefined;
    /**
     * Whether this column offers click-to-sort.
     * DataTable renders a sort control for it and reports the user's intent —
     * the sort itself is performed by the collection pipeline.
     * Has no effect in GroupedDataTable (group-level sort is driven by rollup values).
     */
    sortable?: boolean;
    /**
     * Whether this column is visible. Defaults to true.
     * Set to false to carry a column in config without displaying it.
     * DataTable filters these out internally.
     */
    visible?: boolean;
    /**
     * Which card slot this column fills when the collection is drawn as cards.
     * A table is flat and ignores it; a card has places to put things and this
     * says where.
     *
     * Opt-in both ways, because the two views answer different questions: a
     * column with no slot is table-only, and `visible: false` with a slot is
     * card-only.
     */
    card?: 'title' | 'subtitle' | 'body';
}

/**
 * Full table configuration object.
 * Produced by domain config builders (e.g. buildPartnershipsTableConfig).
 * Passed directly to DataTable.
 */
export interface TableConfig<T = unknown>
{
    columns: TableColumnConfig<T>[];
    emptyMessage?: string;
}

/**
 * @deprecated Use TableColumnConfig instead.
 * Alias kept for migration of existing consumers.
 */
export type Column<T> = TableColumnConfig<T>;

export interface DataTableProps<T>
{
    columns: TableColumnConfig<T>[];
    /** Rows already searched, filtered and sorted. Rendered in the order given. */
    rows: T[];
    getRowId: ( row: T ) => string;
    onRowClick?: ( row: T ) => void;
    /** Currently sorted column key. Display only. */
    sortKey?: string;
    /** Direction of the active sort. Display only. */
    sortDir?: SortDirection;
    /** Reports a sortable header click. Omit and headers render as plain labels. */
    onSortChange?: ( key: string ) => void;
    /**
     * Row to mark as selected. Marked the same way a selected nav item is —
     * `selected.bg` plus a graphite stripe — so selection reads identically
     * across the app.
     */
    selectedRowId?: string;
    isLoading?: boolean;
    stickyHeader?: boolean;
    maxHeight?: string | number;
    emptyMessage?: string;
    /**
     * Extracts a change key from each row. When the key changes between
     * renders, that row receives the realtime trace animation. Omit to
     * disable change tracking.
     */
    /**
     * Returns a nonce for a row that changed via realtime. When the nonce
     * changes between renders, that row receives the realtime trace animation.
     * Omit to disable change animation.
     */
    getRowChangeNonce?: ( row: T ) => number | undefined;
}
