/**
 * buildMeasurementSourcesTableConfig
 *
 * Table configuration for the measurement sources list.
 *
 * Column order follows how a source is read:
 * 1. Source       — the label, from model registry.
 * 2. Key          — push, manual, or a connector name, from model registry.
 * 3. Delivers     — one measurement per event or one total per bucket, from model registry.
 * 4. Measurements — the names it may write, from model registry.
 *
 * Card slots: the label titles the card, the key subtitles it, and what it delivers and
 * may write fill its body.
 *
 * Delivers and Measurements carry no renderer here: one translates and one joins a list,
 * so the orchestrator supplies both and this file stays free of JSX and i18n lookups.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { MeasurementSource } from '../types/measurementSource.types';

/** Module-level cache — built once after the model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<MeasurementSource> | null = null;

export function buildMeasurementSourcesTableConfig(): TableConfig<MeasurementSource>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<MeasurementSource>( tableColumnFactory.getTableColumns( 'measurementSource' ) );

    const columns: ( TableColumnConfig<MeasurementSource> | undefined )[] = [
        byKey['label']
            ? {
                ...withLabel( byKey['label'], 'tables.sources.columns.label' ),
                sortable: true, card: 'title', emphasis: 'primary',
            }
            : {
                key: 'label', label: 'tables.sources.columns.label', type: 'text',
                sortable: true, card: 'title', emphasis: 'primary',
            },

        byKey['key']
            ? {
                ...withLabel( byKey['key'], 'tables.sources.columns.key' ),
                sortable: true, card: 'subtitle', emphasis: 'secondary',
            }
            : undefined,

        // Translated by the orchestrator.
        byKey['sourceType']
            ? { ...withLabel( byKey['sourceType'], 'tables.sources.columns.sourceType' ), sortable: true, card: 'body' }
            : undefined,

        // Joined by the orchestrator.
        {
            key: 'allowedMeasurementNames',
            label: 'tables.sources.columns.allowedMeasurementNames',
            type: 'text',
            card: 'body',
        },
    ];

    const visible = columns.filter(
        ( column ): column is TableColumnConfig<MeasurementSource> => column !== undefined
    );

    cachedConfig = {
        columns: visible,
        emptyMessage: 'pages.sources.emptyState.headline',
    };

    return cachedConfig;
}
