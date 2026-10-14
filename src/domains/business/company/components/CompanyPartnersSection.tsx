/**
 * CompanyPartnersSection
 *
 * Our contacts at this company. Cards rather than a table — a partnership is
 * a person plus a rating, which reads badly as a row.
 *
 * The card is `PartnershipCard`, the same one the grouped table expands to, so
 * state control and the swipe gestures come with it rather than being rebuilt
 * for the profile. This section owns ordering, search, filtering and paging.
 *
 * The body is fixed height and pages rather than scrolls, so the page size is the number
 * of cards that fit it.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, EmptyState } from '@/components/ui';
import { ResponsiveButton } from '@/components/ui/inputs/ResponsiveButton';
import { ProfileSection, PROFILE_SECTION_FOOTER_HEIGHT } from '@/components/container/ProfileSection';
import { CollectionPagination, CollectionToolbar } from '@/components/collection';
import { useCollection, type SortValue } from '@/core/collection';
import { timestampOf } from '@/core/utils';
import { typeRegistry } from '@/core/models/TypeRegistry';
import { typeCatalogue } from '@/domains/system';
import { PartnershipCard } from '../../partnership';
import { buildPartnershipFilters } from '../../partnership/orchestrators/partnerships.orchestrator';
import type { Partnership } from '../../partnership/types/partnership.types';

export interface CompanyPartnersSectionProps
{
    partnerships: Partnership[];
    pageSize?: number;
    /** Shared with the other sections so the row lines up. */
    bodyHeight?: number;
    onAddPartnership?: () => void;
    onEditPartnership?: ( partnership: Partnership ) => void;
    realtimeChanges?: Record<string, number>;
}

/** A partnership with its translated type, so search reaches the type as displayed. */
type PartnershipRow = Partnership & { typeText: string };

const SEARCH_KEYS = ['contactName', 'contactEmail', 'contactPhone', 'typeText'];

/** Current relationships first, then most recently started. */
const CURRENT_FIRST: Record<string, SortValue<PartnershipRow>> = {
    recency: partnership => -(
        partnership.endedAt ? 0 : 1_000_000_000_000_000
    ) - timestampOf( partnership.startedAt ),
};

export function CompanyPartnersSection( {
    partnerships, pageSize = 4, bodyHeight = 320, onAddPartnership, onEditPartnership, realtimeChanges,
}: CompanyPartnersSectionProps )
{
    const { t } = useTranslation();

    const rows = useMemo<PartnershipRow[]>( () => partnerships.map( partnership => ( {
        ...partnership,
        typeText: t( `types.partnershipType.${typeRegistry.getLabel( partnership.partnershipTypeId )}` ),
    } ) ), [partnerships, t] );

    /** Type facet over the partnerships loaded. */
    const { filters, filterOptions } = useMemo(
        () => buildPartnershipFilters( partnerships, typeCatalogue ),
        [partnerships],
    );

    const collection = useCollection( rows, {
        searchKeys: SEARCH_KEYS,
        sortValues: CURRENT_FIRST,
        filters,
        pageSize,
        initialState: { sort: { key: 'recency', direction: 'asc' } },
    } );

    // No partnerships at all is an empty state with its own call to action; search, filter and
    // paging only appear once there is something to search, filter or page.
    const isEmpty = partnerships.length === 0;

    return (
        <ProfileSection
            title={t( 'pages.company.section.partner' )}
            action={isEmpty ? undefined : (
                <CollectionToolbar
                    search={collection.search}
                    onSearchChange={collection.setSearch}
                    searchPlaceholder="collection.toolbar.search"
                    filterOptions={filterOptions}
                    activeFilterKeys={collection.activeFilterKeys}
                    onFilterToggle={collection.toggleFilter}
                    actions={
                        <ResponsiveButton
                            variant="outlined"
                            color="primary"
                            size="small"
                            iconKey="plus"
                            label={t( 'pages.company.partner.addButton' )}
                            onClick={onAddPartnership}
                        />
                    }
                />
            )}
            // Empty, the section has no footer; its body takes that height so the section keeps its size.
            bodyHeight={isEmpty ? bodyHeight + PROFILE_SECTION_FOOTER_HEIGHT : bodyHeight}
            disableBodyPadding
            footer={isEmpty ? undefined : (
                <CollectionPagination
                    page={collection.page}
                    pageCount={collection.pageCount}
                    totalCount={collection.totalCount}
                    pageSize={collection.pageSize}
                    onPageChange={collection.setPage}
                />
            )}
        >
            {isEmpty
                ? (
                    <EmptyState
                        size="compact"
                        headline={t( 'pages.company.partner.emptyState.headline' )}
                        subtext={t( 'pages.company.partner.emptyState.subtext' )}
                        actions={onAddPartnership
                            ? [{ label: t( 'pages.company.partner.addButton' ), variant: 'contained', onClick: onAddPartnership }]
                            : []}
                    />
                )
                : collection.totalCount === 0
                    ? (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, py: 2 }}>
                            {t( 'collection.noMatches' )}
                        </Typography>
                    )
                    : collection.visibleRows.map( partnership => (
                        <PartnershipCard
                            key={partnership.id}
                            partnership={partnership}
                            surface="panel"
                            onEdit={onEditPartnership}
                            changeNonce={realtimeChanges ? realtimeChanges[partnership.id] ?? 0 : undefined}
                        />
                    ) )
            }
        </ProfileSection>
    );
}

export default CompanyPartnersSection;
