/**
 * CollectionView - Types
 *
 * Split from the component so `CollectionViewToggle` can name the mode without
 * importing the view it sits beside.
 */

import type { ReactNode } from 'react';
import type { SortDirection } from '@/core/collection';
import type { TableColumnConfig } from '@/components/tables';

/** Which presentation is showing. Never changed by a selection. */
export type CollectionViewMode = 'table' | 'card';

/**
 * Which card slot a column fills.
 *
 * A table is flat, so a column needs no role. A card has places to put things,
 * and this is how the same column config says where. Columns with no role fill
 * the card's body in config order.
 */
export type CollectionCardSlot = 'title' | 'subtitle' | 'body';

export interface CollectionViewProps<TRow>
{
    /** Presentation only. The toggle lives in the caller's chrome. */
    mode: CollectionViewMode;
    /** Rows already searched, filtered and sorted. Drawn in the order given. */
    rows: TRow[];
    /**
     * Columns, owned by the caller. The same config drives both modes: the table
     * renders one cell per column, the card reads each column's `card` slot.
     *
     * Card mode expects one column to declare `card: 'title'`. It is never
     * inferred — a card's heading would otherwise follow table order and change
     * when columns are rearranged.
     */
    columns: TableColumnConfig<TRow>[];
    getRowId: ( row: TRow ) => string;
    onRowClick?: ( row: TRow ) => void;
    /** Marked the same way in either mode, so a selection survives a switch. */
    selectedRowId?: string;

    /** Passed through to the table's sortable headers. Cards have no headers. */
    sortKey?: string;
    sortDir?: SortDirection;
    onSortChange?: ( key: string ) => void;

    isLoading?: boolean;
    /**
     * Shown when the collection holds nothing at all — the caller's `EmptyState`,
     * with its headline, subtext and call to action.
     *
     * Distinct from `emptyMessage`: a collection with records that a search or
     * filter has emptied is a different situation, and offering "add your first
     * one" there answers a question the user did not ask.
     */
    emptyState?: ReactNode;
    /**
     * Shown when rows exist but the current search or filter matches none of
     * them. A translation key, so a missing one surfaces as a missing key.
     */
    emptyMessage?: string;
    /**
     * Whether the collection itself is empty, as opposed to emptied by a filter.
     * The view is handed processed rows and cannot tell the two apart.
     */
    isEmpty?: boolean;
    /**
     * Returns a nonce for a row that changed via realtime. When it changes
     * between renders that row traces, in either mode.
     */
    getRowChangeNonce?: ( row: TRow ) => number | undefined;

    /**
     * Minimum card width before the grid adds a column. Intrinsic rather than
     * breakpoint-driven, so a detail panel beside the grid is accounted for.
     */
    minCardWidth?: number;

    /**
     * Summary cards above the collection — a metric row, injected by the page.
     * Always drawn, including while loading and when the collection is empty: a
     * count of nothing is still the answer to the question it asks.
     */
    metrics?: ReactNode;

    /**
     * Field the rows are partitioned on, dot-notation resolved. Omit for a flat
     * collection.
     *
     * Grouping sits above the renderer: each group gets a heading and its rows
     * are drawn by the same card grid or table below it, so a group reads the
     * same in either mode.
     */
    groupBy?: string;
    /**
     * Heading for a group. Receives the group's rows and its key; returns a
     * translation key or literal text. Defaults to the key itself.
     */
    groupLabel?: ( rows: TRow[], groupKey: string ) => string;
}
