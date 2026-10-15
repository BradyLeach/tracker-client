/**
 * buildLearningsTableConfig
 *
 * Table configuration for the learnings list.
 *
 * Column order follows how a learning is read:
 * 1. Learning   — what the experiment showed, from model registry.
 * 2. Experiment — the experiment it came from, derived and declared manually.
 * 3. Recorded   — when it was concluded, from model registry, promoted to 'date'.
 *
 * Card slots: the experiment titles the card, the learning fills its body beneath, and
 * the date closes it.
 *
 * Experiment carries no renderer here: it resolves through the experiments the page
 * holds, so the orchestrator supplies it and this file stays free of JSX and lookups.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel, promoteType } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { Learning } from '../types/learning.types';

/** Module-level cache — built once after the model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<Learning> | null = null;

export function buildLearningsTableConfig(): TableConfig<Learning>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<Learning>( tableColumnFactory.getTableColumns( 'learning' ) );

    const columns: ( TableColumnConfig<Learning> | undefined )[] = [
        // Resolved through the experiments — see the orchestrator.
        {
            key: 'experimentId',
            label: 'tables.learnings.columns.experiment',
            type: 'text',
            sortable: true,
            card: 'title',
            emphasis: 'primary',
        },

        byKey['body']
            ? { ...withLabel( byKey['body'], 'tables.learnings.columns.body' ), card: 'body' }
            : { key: 'body', label: 'tables.learnings.columns.body', type: 'text', card: 'body' },

        byKey['createdAt']
            ? {
                ...promoteType( withLabel( byKey['createdAt'], 'tables.learnings.columns.createdAt' ), 'date' ),
                sortable: true, card: 'body', emphasis: 'secondary',
            }
            : {
                key: 'createdAt', label: 'tables.learnings.columns.createdAt', type: 'date',
                sortable: true, card: 'body', emphasis: 'secondary',
            },
    ];

    const visible = columns.filter(
        ( column ): column is TableColumnConfig<Learning> => column !== undefined
    );

    cachedConfig = {
        columns: visible,
        emptyMessage: 'pages.learnings.emptyState.headline',
    };

    return cachedConfig;
}
