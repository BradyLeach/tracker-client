/**
 * buildFormulasTableConfig
 *
 * Table configuration for the formulas list.
 *
 * Column order follows how a formula is read:
 * 1. Formula    — the label, from model registry.
 * 2. Key        — from model registry.
 * 3. Expression — what it computes over metric keys, from model registry.
 * 4. Unit       — the unit its result is expressed in, from model registry.
 *
 * Card slots: the label titles the card, the expression subtitles it, and the unit fills
 * its body. Key carries no slot — the expression already names what matters.
 *
 * Unit carries no renderer here: it translates, so the orchestrator supplies it and this
 * file stays free of JSX and i18n lookups.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { Formula } from '../types/formula.types';

/** Module-level cache — built once after the model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<Formula> | null = null;

/**
 * Returns the table configuration for the formulas list.
 *
 * @returns TableConfig<Formula> ready to pass to DataTable.
 */
export function buildFormulasTableConfig(): TableConfig<Formula>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<Formula>( tableColumnFactory.getTableColumns( 'formula' ) );

    const columns: ( TableColumnConfig<Formula> | undefined )[] = [
        byKey['label']
            ? {
                ...withLabel( byKey['label'],
                    'tables.formulas.columns.label' ), sortable: true, card: 'title', emphasis: 'primary',
            }
            : {
                key: 'label',
                label: 'tables.formulas.columns.label', type: 'text', sortable: true, card: 'title', emphasis: 'primary',
            },

        byKey['key']
            ? { ...withLabel( byKey['key'], 'tables.formulas.columns.key' ), sortable: true, emphasis: 'secondary' }
            : undefined,

        byKey['expression']
            ? { ...withLabel( byKey['expression'], 'tables.formulas.columns.expression' ), card: 'subtitle', emphasis: 'secondary' }
            : undefined,

        // Translated by the orchestrator.
        byKey['outputUnit']
            ? { ...withLabel( byKey['outputUnit'], 'tables.formulas.columns.outputUnit' ), sortable: true, card: 'body' }
            : undefined,
    ];

    const visible = columns.filter(
        ( column ): column is TableColumnConfig<Formula> => column !== undefined
    );

    cachedConfig = {
        columns: visible,
        emptyMessage: 'pages.metrics.formulaEmptyState.headline',
    };

    return cachedConfig;
}
