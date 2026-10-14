/**
 * Partnerships Orchestrator
 *
 * All render functions, data derivation, and business logic for partnerships views.
 * Config files define structure; this orchestrator provides behaviour.
 */

import i18n from 'i18next';
import { stateRegistry } from '@/core/models/StateRegistry';
import { typeRegistry } from '@/core/models/TypeRegistry';
import { isActiveStateCategory } from '@/config/stateCategory.config';
import { buildTypeFacet } from '@/core/collection';
import { StatusChip } from '@/components/shared/status';
import { CompanyHeader } from '../../company';
import { PartnershipCard } from '../components/PartnershipCard';
import type { CollectionFilter } from '@/core/collection';
import type { CollectionFilterOption } from '@/components/collection';
import type { TypeCatalogue } from '@/domains/system';
import type { GroupedTableBehavior } from '@/components/tables';
import type { MetricDefinition } from '@/components/shared/metrics';
import type { Company } from '../../company';
import type { Partnership } from '../types/partnership.types';

interface PartnershipsBehaviorCallbacks
{
    onEditCompany?: ( company: Company ) => void;
    onEditPartnership?: ( partnership: Partnership ) => void;
}

/**
 * Returns true if this partnership's state category is 'active'.
 */
export function isPartnershipActive( row: Partnership ): boolean
{
    const state = stateRegistry.getState( row.currentStateGraphStateId ?? '' );
    return isActiveStateCategory( state?.stateCategory?.name );
}

/**
 * Returns true if at least one partnership in the group is actively in progress.
 *
 * Uses the same 'active' category rule as isPartnershipActive. Non-terminal is
 * deliberately not enough — prospect, review and hold are all non-terminal but
 * describe a relationship that is not currently trading.
 */
export function isPartnershipGroupActive( rows: Partnership[] ): boolean
{
    return rows.some( isPartnershipActive );
}

/**
 * Type is a facet, the same as the companies page: ticking two types means either.
 * Options come from the partnerships loaded, so the menu never offers an empty result.
 */
export function buildPartnershipFilters(
    partnerships: readonly Partnership[],
    catalogue: TypeCatalogue,
): { filters: CollectionFilter<Partnership>[]; filterOptions: CollectionFilterOption[] }
{
    const typeFacet = buildTypeFacet<Partnership>( {
        model: 'partnershipType',
        presentIds: partnerships.map( partnership => partnership.partnershipTypeId ),
        matches: ( partnership, typeId ) => partnership.partnershipTypeId === typeId,
        catalogue,
    } );

    return { filters: typeFacet.filters, filterOptions: typeFacet.options };
}

/**
 * Metric definitions for the partnerships page.
 * Resolved at module level — stateRegistry is guaranteed loaded at this point.
 * change is omitted until a historical data source is available.
 */
export function getPartnershipMetricDefinitions(): MetricDefinition<Partnership>[]
{
    return [
        {
            key: 'active-suppliers',
            label: 'Active Suppliers',
            predicate: row => row.partnershipTypeId === typeRegistry.getId( 'partnershipType', 'supplier' ) && isPartnershipActive( row ),
        },
        {
            key: 'top-rated',
            label: 'Top Rated',
            predicate: row => row.rating !== undefined && row.rating >= 4,
        },
    ];
}

/**
 * Returns the GroupedDataTable behaviour for the partnerships grouped view.
 * Spread alongside the config when rendering GroupedDataTable.
 *
 * Usage — grouping and ordering happen before the renderer sees anything:
 *   const config = buildPartnershipsGroupedTableConfig();
 *   const { groupLabel, ...behavior } = getPartnershipsGroupedTableBehavior({ onEditCompany, onEditPartnership });
 *
 *   const groups = groupRows( partnerships, config.groupBy, groupLabel );
 *   const collection = useCollection( groups, {
 *       fields: [GROUP_LABEL_FIELD],
 *       sortValues: rollupSortValues( behavior.rollups ),
 *   } );
 *
 *   <GroupedDataTable
 *       config={config}
 *       {...behavior}
 *       groups={collection.visibleRows}
 *       getRowId={r => r.id}
 *       sortKey={collection.sortKey}
 *       sortDir={collection.sortDir}
 *       onSortChange={collection.toggleSort}
 *   />
 */
export function getPartnershipsGroupedTableBehavior( callbacks: PartnershipsBehaviorCallbacks = {} ): GroupedTableBehavior<Partnership>
{
    const { onEditCompany, onEditPartnership } = callbacks;

    return {
        groupLabel: ( rows, groupKey ) => rows[0]?.company?.name ?? groupKey,

        renderGroupContent: ( rows, _groupKey, label ) => (
            <CompanyHeader
                company={rows[0]?.company}
                label={label}
                partnerships={rows}
                variant="row"
                onEdit={onEditCompany}
            />
        ),

        renderChildContent: ( row ) => <PartnershipCard partnership={row} onEdit={onEditPartnership} />,

        rollups: {
            currentStateGraphStateId: ( rows ) =>
            {
                const active = isPartnershipGroupActive( rows );
                return {
                    value: active ? 1 : 0,
                    node: (
                        <StatusChip
                            stateName={i18n.t( active ? 'shared.status.active' : 'shared.status.inactive' )}
                            stateCategoryColour={active ? 'info' : 'muted'}
                            size="small"
                            variant="outlined"
                        />
                    ),
                };
            },
        },

        groupAccentColor: ( rows ) => isPartnershipGroupActive( rows ) ? 'info.main' : 'grey.400',
    };
}
