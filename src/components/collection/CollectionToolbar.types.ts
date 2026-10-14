import type { ReactNode } from 'react';
import type { SortDirection } from '@/core/collection';
import type { IconKey } from '@/config/icons.config';

/** A sortable choice offered by the toolbar. Declared in config, not per page. */
export interface CollectionSortOption
{
    /** Sort key reported back. Must match a pipeline field or sortValues key. */
    key: string;
    /** Display label or i18n key. */
    label: string;
}

/**
 * A named filter offered by the toolbar. Keys match the pipeline's filters.
 *
 * Only `key` and `label` are required; the rest are optional layout, named as
 * ConfigMenu names them, so a plain list renders as a plain list.
 */
export interface CollectionFilterOption
{
    key: string;
    /** Display label or i18n key. */
    label: string;
    /** Icon before the label. */
    iconKey?: IconKey;
    /** Header label or i18n key. The header renders above the first option of each section. */
    section?: string;
    /** Separates this option from the one above. */
    showDividerBefore?: boolean;
}

export interface CollectionToolbarProps
{
    /** Current search term. */
    search?: string;
    onSearchChange?: ( term: string ) => void;
    /** Placeholder or i18n key. */
    searchPlaceholder?: string;

    /** Offered sorts. Omit to hide the sort control. */
    sortOptions?: readonly CollectionSortOption[];
    sortKey?: string;
    sortDir?: SortDirection;
    /** Reports the chosen key. Re-reporting the active key flips direction. */
    onSortChange?: ( key: string ) => void;

    /** Offered filters. Omit to hide the filter control. */
    filterOptions?: readonly CollectionFilterOption[];
    activeFilterKeys?: readonly string[];
    onFilterToggle?: ( key: string ) => void;
    /** A checkbox before each filter option. Off by default: selection shows as the highlight. */
    filterShowCheckbox?: boolean;
    /** Several filter options at once. When off, choosing one replaces the rest; the menu stays open either way. */
    filterMultiSelect?: boolean;
    /** Above the filter options, e.g. a search field. Separated from them. */
    filterHeader?: ReactNode;
    /** Below the filter options, e.g. a scope control. Separated from them. */
    filterFooter?: ReactNode;

    /** Page-specific actions, e.g. Add Partner. Rendered at the trailing edge. */
    actions?: ReactNode;
}
