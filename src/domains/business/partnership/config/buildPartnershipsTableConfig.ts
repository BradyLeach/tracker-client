/**
 * buildPartnershipsTableConfig
 *
 * Builds the table configuration for the partnerships list view.
 *
 * Column order and selection follows the domain display contract:
 * 1. Company name   — hydrated association, declared manually.
 * 2. Type           — from model registry (enum).
 * 3. Contact name   — from model registry (text).
 * 4. Contact email  — from model registry (text).
 * 5. Contact phone  — from model registry (text).
 * 6. Rating         — from model registry, promoted to 'rating' type.
 * 7. Status         — hydrated state association, declared manually.
 *
 * All column labels are i18n keys — translated at render time by DataTable.
 * Config is built once and cached for the application lifetime.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel, promoteType } from '@/components/tables';
import type { TableConfig, TableColumnConfig } from '@/components/tables';
import type { Partnership } from '../types/partnership.types';

/** Module-level cache — built once after model registry is loaded at bootstrap. */
let cachedConfig: TableConfig<Partnership> | null = null;

/**
 * Returns the table configuration for the partnerships list.
 *
 * On first call, resolves columns from the model registry and caches the result.
 * Subsequent calls return the cached config at zero cost.
 *
 * @returns TableConfig<Partnership> ready to pass directly to DataTable.
 */
export function buildPartnershipsTableConfig(): TableConfig<Partnership>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<Partnership>( tableColumnFactory.getTableColumns( 'partnership' ) );

    const columns: TableColumnConfig<Partnership>[] = [
        {
            key: 'company',
            label: 'tables.partnerships.columns.company',
            type: 'text',
            render: ( row: Partnership ) => row.company?.name ?? '—',
        },
        byKey['partnershipType'] ? withLabel( byKey['partnershipType'], 'tables.partnerships.columns.partnershipType' ) : undefined,
        byKey['contactName'] ? withLabel( byKey['contactName'], 'tables.partnerships.columns.contactName' ) : undefined,
        byKey['contactEmail'] ? withLabel( byKey['contactEmail'], 'tables.partnerships.columns.contactEmail' ) : undefined,
        byKey['contactPhone'] ? withLabel( byKey['contactPhone'], 'tables.partnerships.columns.contactPhone' ) : undefined,
        byKey['rating'] ? promoteType( withLabel( byKey['rating'], 'tables.partnerships.columns.rating' ), 'rating' ) : undefined,
        {
            key: 'currentStateGraphStateId',
            label: 'tables.partnerships.columns.currentState',
            type: 'state',
        },
    ].filter( ( c ): c is TableColumnConfig<Partnership> => !!c );

    cachedConfig = {
        columns,
        emptyMessage: 'pages.partnerships.emptyState.headline',
    };

    return cachedConfig;
}
