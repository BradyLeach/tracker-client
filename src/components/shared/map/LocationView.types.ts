/**
 * LocationView - Types
 *
 * Split from the component so `LocationViewToggle` can name the mode without
 * importing the view it sits beside.
 */

import type { SortDirection } from '@/core/collection';
import type { TableColumnConfig } from '@/components/tables';
import type { MapPin } from '@/services/map/map';

/** Which presentation is showing. Never changed by a selection. */
export type LocationViewMode = 'list' | 'map';

export interface LocationViewProps
{
    /** Presentation only. The toggle lives in the caller's chrome. */
    mode: LocationViewMode;
    /**
     * The pins to draw, in the order given. List mode is handed the page the
     * pipeline produced; map mode the whole set, since a map has no pages.
     */
    pins: MapPin[];
    /** Columns for list mode, owned by the caller like any other table. */
    columns: TableColumnConfig<MapPin>[];
    /**
     * Height in either mode. A map collapses without one, and a list that sets
     * its own height would change the layout on every toggle.
     */
    height: number;
    /**
     * Translation key for the empty state, used by both modes. A key, not
     * text: a missing one must surface as a missing key.
     */
    emptyMessage: string;
    isLoading?: boolean;

    /** Passed through to the table's sortable headers. */
    sortKey?: string;
    sortDir?: SortDirection;
    onSortChange?: ( key: string ) => void;

    /**
     * The selected location — the selected row in list mode, the centred and
     * opened pin in map mode. One value read two ways, so a selection survives
     * a switch between them.
     */
    focusPinId?: string;
    /** Reports a selection from either mode; holding it is the caller's. */
    onPinSelect?: ( pin: MapPin ) => void;
}
