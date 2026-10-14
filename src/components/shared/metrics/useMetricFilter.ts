/**
 * useMetricFilter
 *
 * Generic hook that owns filter toggle state for a set of CountMetric definitions.
 * Returns ready-to-render CountMetricProps for each definition and the filtered row set.
 *
 * - Counts are always derived from the raw (unfiltered) rows so numbers never shift.
 * - Clicking the active metric again clears the filter (toggle behaviour).
 * - A definition with predicate: null counts all rows and clears the filter when active.
 *
 * Usage:
 *   const definitions = getPartnershipMetricDefinitions();  // from orchestrator
 *   const { metrics, visibleRows } = useMetricFilter(partnerships, definitions);
 */

import { useState } from 'react';
import type { CountMetricProps, CountMetricChange } from './CountMetric';

export interface MetricDefinition<T>
{
    /** Unique key used to track which metric is active. */
    key: string;
    /** Display label passed through to CountMetric. */
    label: string;
    /** Filter predicate. null means "show all rows" (a total/all metric). */
    predicate: ( ( row: T ) => boolean ) | null;
    /** Optional trend indicator. Parent computes and passes in. */
    change?: CountMetricChange;
    /** Optional sparkline series. */
    series?: { x: string | number; y: number }[];
}

export interface UseMetricFilterResult<T>
{
    /** Ready-to-render props for each metric. Spread directly onto CountMetric. */
    metrics: CountMetricProps[];
    /** The filtered row set. Pass to your table. */
    visibleRows: T[];
}

export function useMetricFilter<T>(
    rows: T[],
    definitions: MetricDefinition<T>[],
): UseMetricFilterResult<T>
{
    const [activeKey, setActiveKey] = useState<string | null>( null );

    const activeDefinition = definitions.find( d => d.key === activeKey ) ?? null;

    const visibleRows = activeDefinition?.predicate
        ? rows.filter( activeDefinition.predicate )
        : rows;

    const metrics: CountMetricProps[] = definitions.map( def => ( {
        label: def.label,
        value: def.predicate ? rows.filter( def.predicate ).length : rows.length,
        change: def.change,
        series: def.series,
        active: def.key === activeKey,
        onClick: () => setActiveKey( prev => prev === def.key ? null : def.key ),
    } ) );

    return { metrics, visibleRows };
}
