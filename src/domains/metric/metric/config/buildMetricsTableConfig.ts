/**
 * buildMetricsTableConfig
 *
 * Table configuration for the metrics list.
 *
 * Column order follows how a metric is read:
 * 1. Metric      — the label, from model registry.
 * 2. Key         — the name formulas reference it by, from model registry.
 * 3. Measurement — the measurement it reads, from model registry.
 * 4. Aggregation — sum, count or unique, from model registry.
 *
 * Card slots: the label titles the card, the key subtitles it, and the measurement and
 * aggregation fill its body.
 *
 * Aggregation carries no renderer here: it translates, so the orchestrator supplies it
 * and this file stays free of JSX and i18n lookups.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { Metric } from '../types/metric.types';

/** Module-level cache — built once after the model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<Metric> | null = null;

/**
 * Returns the table configuration for the metrics list.
 *
 * @returns TableConfig<Metric> ready to pass to DataTable.
 */
export function buildMetricsTableConfig(): TableConfig<Metric>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<Metric>( tableColumnFactory.getTableColumns( 'metric' ) );

    const columns: ( TableColumnConfig<Metric> | undefined )[] = [
        byKey['label']
            ? { ...withLabel( byKey['label'], 'tables.metrics.columns.label' ), sortable: true, card: 'title', emphasis: 'primary' }
            : {
                key: 'label',
                label: 'tables.metrics.columns.label', type: 'text', sortable: true, card: 'title', emphasis: 'primary',
            },

        byKey['key']
            ? {
                ...withLabel( byKey['key'],
                    'tables.metrics.columns.key' ), sortable: true, card: 'subtitle', emphasis: 'secondary',
            }
            : undefined,

        byKey['measurementName']
            ? { ...withLabel( byKey['measurementName'], 'tables.metrics.columns.measurementName' ), sortable: true, card: 'body' }
            : undefined,

        // Translated by the orchestrator.
        byKey['aggregation']
            ? { ...withLabel( byKey['aggregation'], 'tables.metrics.columns.aggregation' ), sortable: true, card: 'body' }
            : undefined,
    ];

    const visible = columns.filter(
        ( column ): column is TableColumnConfig<Metric> => column !== undefined
    );

    cachedConfig = {
        columns: visible,
        emptyMessage: 'pages.metrics.emptyState.headline',
    };

    return cachedConfig;
}
