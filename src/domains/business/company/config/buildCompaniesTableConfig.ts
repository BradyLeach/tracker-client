/**
 * buildCompaniesTableConfig
 *
 * Table configuration for the companies list.
 *
 * Column order follows the domain display contract:
 * 1. Name      — from model registry.
 * 2. Website   — from model registry, promoted to 'url'.
 * 3. Tax ID    — from model registry.
 * 4. Types     — hydrated from partnerships, declared manually.
 * 5. Status    — aggregate of the company's partnership states, declared manually.
 *
 * Card slots: the name titles the card, the website subtitles it, and the types
 * and status fill its body. Tax ID carries no slot — it belongs to the table,
 * where there is room for it.
 *
 * Types and Status both derive from `company.partnerships`, which the service
 * hydrates by default. Their cells are rendered by the orchestrator so this
 * file stays free of JSX and state-registry lookups.
 *
 * All labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel, promoteType } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { Company } from '../types/company.types';

/** Module-level cache — built once after the model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<Company> | null = null;

/** The company's own icon beside its name, or a building when it has none. */
const COMPANY_ICON = { field: 'icon', fallback: 'building' } satisfies NonNullable<TableColumnConfig<Company>['icon']>;

/**
 * Returns the table configuration for the companies list.
 *
 * Columns needing hydrated data carry no renderer here — the orchestrator
 * supplies those, the same way the partnerships grouped table does.
 *
 * @returns TableConfig<Company> ready to pass to DataTable.
 */
export function buildCompaniesTableConfig(): TableConfig<Company>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<Company>( tableColumnFactory.getTableColumns( 'company' ) );

    const columns: ( TableColumnConfig<Company> | undefined )[] = [
        byKey['name']
            ? {
                ...withLabel( byKey['name'], 'tables.companies.columns.name' ),
                sortable: true, card: 'title', icon: COMPANY_ICON, emphasis: 'primary',
            }
            : {
                key: 'name', label: 'tables.companies.columns.name', type: 'text', sortable: true, card: 'title',
                icon: COMPANY_ICON, emphasis: 'primary',
            },

        byKey['websiteUrl']
            ? {
                ...promoteType( withLabel( byKey['websiteUrl'], 'tables.companies.columns.website' ), 'url' ),
                sortable: true, card: 'subtitle', emphasis: 'secondary',
            }
            : undefined,

        byKey['taxIdentifier']
            ? {
                ...withLabel( byKey['taxIdentifier'], 'tables.companies.columns.taxIdentifier' ),
                sortable: true, emphasis: 'secondary',
            }
            : undefined,

        // Both derive from the hydrated partnerships — see the orchestrator.
        {
            key: 'partnershipTypes',
            label: 'tables.companies.columns.types',
            type: 'text',
            card: 'body',
        },
        {
            key: 'aggregateStatus',
            label: 'tables.companies.columns.status',
            type: 'text',
            align: 'right',
            card: 'body',
        },
    ];

    const visible = columns.filter(
        ( column ): column is TableColumnConfig<Company> => column !== undefined
    );

    cachedConfig = {
        columns: visible,
        emptyMessage: 'pages.partnerships.emptyState.headline',
    };

    return cachedConfig;
}
