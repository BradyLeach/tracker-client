/**
 * buildExperimentsTableConfig
 *
 * Table configuration for the experiments list.
 *
 * Column order follows how an experiment is read:
 * 1. Experiment — the title, from model registry.
 * 2. Hypothesis — from model registry.
 * 3. Status     — the current state graph state, declared manually.
 * 4. Ends       — the window's end, from model registry, promoted to 'date'.
 * 5. Decision   — recorded only by concluding, from model registry.
 *
 * Card slots: the title titles the card, the hypothesis subtitles it, and the
 * status and end date fill its body. Decision carries no slot — it belongs to the
 * table, where an empty cell for every unconcluded experiment costs nothing.
 *
 * Status is a 'state' column, drawn by the table's own state renderer. Decision
 * carries no renderer here: it translates, so the orchestrator supplies it along
 * with the search and sort values for both, and this file stays free of JSX and
 * registry lookups.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel, promoteType } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { Experiment } from '../types/experiment.types';

/** Module-level cache — built once after the model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<Experiment> | null = null;

/**
 * Returns the table configuration for the experiments list.
 *
 * @returns TableConfig<Experiment> ready to pass to DataTable.
 */
export function buildExperimentsTableConfig(): TableConfig<Experiment>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<Experiment>( tableColumnFactory.getTableColumns( 'experiment' ) );

    const columns: ( TableColumnConfig<Experiment> | undefined )[] = [
        byKey['title']
            ? {
                ...withLabel( byKey['title'], 'tables.experiments.columns.title' ),
                sortable: true, card: 'title', emphasis: 'primary',
            }
            : {
                key: 'title', label: 'tables.experiments.columns.title', type: 'text', sortable: true, card: 'title',
                emphasis: 'primary',
            },

        byKey['hypothesis']
            ? {
                ...withLabel( byKey['hypothesis'], 'tables.experiments.columns.hypothesis' ),
                card: 'subtitle', emphasis: 'secondary',
            }
            : undefined,

        // Drawn by the table's state renderer; searched and sorted through the orchestrator.
        {
            key: 'currentStateGraphStateId',
            label: 'tables.experiments.columns.status',
            type: 'state',
            sortable: true,
            card: 'body',
        },

        byKey['windowEnd']
            ? {
                ...promoteType( withLabel( byKey['windowEnd'], 'tables.experiments.columns.windowEnd' ), 'date' ),
                sortable: true, card: 'body',
            }
            : {
                key: 'windowEnd', label: 'tables.experiments.columns.windowEnd', type: 'date', sortable: true, card: 'body',
            },

        // Translated by the orchestrator.
        byKey['decision']
            ? {
                ...withLabel( byKey['decision'], 'tables.experiments.columns.decision' ),
                sortable: true, align: 'right',
            }
            : undefined,
    ];

    const visible = columns.filter(
        ( column ): column is TableColumnConfig<Experiment> => column !== undefined
    );

    cachedConfig = {
        columns: visible,
        emptyMessage: 'pages.experiments.emptyState.headline',
    };

    return cachedConfig;
}
