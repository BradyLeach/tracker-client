/**
 * buildPartnershipsGroupedTableConfig
 *
 * Pure data configuration for the partnerships grouped table.
 * No render functions, no business logic — structure and i18n keys only.
 *
 * Grouping:  by companyId — one group per company.
 * Children:  partnershipType, contactName, contactEmail, contactPhone, rating, state.
 */

import { tableColumnFactory, indexColumnsByKey, withLabel, promoteType } from '@/components/tables';
import type { GroupedTableConfig } from '@/components/tables';
import type { Partnership } from '../types/partnership.types';

let cachedConfig: GroupedTableConfig<Partnership> | null = null;

export function buildPartnershipsGroupedTableConfig(): GroupedTableConfig<Partnership>
{
    if( cachedConfig ) return cachedConfig;

    const byKey = indexColumnsByKey<Partnership>( tableColumnFactory.getTableColumns( 'partnership' ) );

    cachedConfig = {
        groupBy: 'companyId',
        groupHeaderLabel: 'tables.partnerships.group.company',
        childSectionLabel: 'tables.partnerships.group.partnerships',
        childColumns: [
            byKey['partnershipType'] ? withLabel( byKey['partnershipType'], 'tables.partnerships.columns.partnershipType' ) : undefined,
            byKey['contactName'] ? withLabel( byKey['contactName'], 'tables.partnerships.columns.contactName' ) : undefined,
            byKey['contactEmail'] ? withLabel( byKey['contactEmail'], 'tables.partnerships.columns.contactEmail' ) : undefined,
            byKey['contactPhone'] ? withLabel( byKey['contactPhone'], 'tables.partnerships.columns.contactPhone' ) : undefined,
            byKey['rating'] ? promoteType( withLabel( byKey['rating'], 'tables.partnerships.columns.rating' ), 'rating' ) : undefined,
            {
                key: 'currentStateGraphStateId',
                label: 'tables.partnerships.columns.currentState',
                type: 'state' as const,
                align: 'center' as const,
            },
        ].filter( ( c ): c is NonNullable<typeof c> => c !== undefined ),
        defaultExpanded: false,
        emptyMessage: 'pages.partnerships.emptyState.headline',
    };

    return cachedConfig;
}
