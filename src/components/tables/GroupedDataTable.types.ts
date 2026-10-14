/**
 * GroupedDataTable Types
 *
 * Split into two concerns:
 *   GroupedTableConfig   — pure data/structure, no render functions
 *   GroupedTableBehavior — render functions and business logic, owned by the orchestrator
 */

import type { ReactNode } from 'react';
import type { CollectionGroup, SortDirection } from '@/core/collection';
import type { TableColumnConfig } from './DataTable.types';

/**
 * Pure data configuration for GroupedDataTable.
 * Contains only field references, i18n keys, and column definitions.
 * No functions, no components, no business logic.
 */
export interface GroupedTableConfig<TRow>
{
    /** Field name on TRow used to extract the group key. */
    groupBy: keyof TRow & string;
    /** i18n key for the top-level header's first (spanning) cell. */
    groupHeaderLabel: string;
    /** i18n key for the child section header label (e.g. "Partnerships", "Orders"). */
    childSectionLabel?: string;
    /** Columns rendered in the per-group sub-header and child data rows. */
    childColumns: TableColumnConfig<TRow>[];
    /** All groups start expanded. Default: false. */
    defaultExpanded?: boolean;
    emptyMessage?: string;
}

/**
 * Behaviour owned by the orchestrator — render functions and business logic.
 *
 * `groupLabel` feeds `groupRows` at the call site, since grouping is a data
 * transformation; the rest is spread onto GroupedDataTable, whose props omit
 * `groupLabel` so it cannot be passed to the renderer by mistake.
 */
export interface GroupedTableBehavior<TRow>
{
    /** Returns the display label for a group. Defaults to the raw groupKey when omitted. */
    groupLabel?: ( rows: TRow[], groupKey: string ) => string;
    /**
     * Overrides the group label cell content.
     * The chevron and count chip are always rendered by the component.
     */
    renderGroupContent?: ( rows: TRow[], groupKey: string, label: string ) => ReactNode;
    /**
     * Overrides child row rendering entirely.
     * Each row is passed individually inside the Collapse panel.
     */
    renderChildContent?: ( row: TRow, index: number ) => ReactNode;
    /**
     * Rollup producers keyed by column key.
     * Each function returns both the sort value and the rendered node.
     * `value` drives group-level sort when that column header is clicked.
     * `node` is rendered in the outer group row cell.
     * Column alignment is derived from the matching childColumns entry.
     */
    rollups?: Record<string, ( rows: TRow[], groupKey: string ) => { value: string | number; node: ReactNode }>;
    /**
     * Returns the MUI sx color string for a group's left-accent bar.
     * Falls back to 'divider' when omitted.
     */
    groupAccentColor?: ( rows: TRow[], groupKey: string ) => string;
}

export interface GroupedDataTableProps<TRow> extends Omit<GroupedTableBehavior<TRow>, 'groupLabel'>
{
    config: GroupedTableConfig<TRow>;
    /** Group records, already derived by `groupRows` and ordered by the pipeline. */
    groups: CollectionGroup<TRow>[];
    getRowId: ( row: TRow ) => string;
    onRowClick?: ( row: TRow ) => void;
    /**
     * Group column key carrying the active sort. Display only.
     * `GROUP_LABEL_KEY` for the label column, or a rollup key.
     */
    sortKey?: string;
    /** Direction of the active sort. Display only. */
    sortDir?: SortDirection;
    /** Reports a click on a sortable group header. Omit to render plain labels. */
    onSortChange?: ( key: string ) => void;
    isLoading?: boolean;
    maxHeight?: string | number;
    /** Optional actions rendered right-aligned inside the group-dimension header cell. */
    headerActions?: ReactNode;
}
