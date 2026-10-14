/**
 * CompanyLocationsSection
 *
 * Where the company operates. A table of locations owned by this company,
 * following the same ProfileSection + DataTable pattern as the other sections.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, EmptyState } from '@/components/ui';
import { ResponsiveButton } from '@/components/ui/inputs/ResponsiveButton';
import { ProfileSection, PROFILE_SECTION_FOOTER_HEIGHT } from '@/components/container/ProfileSection';
import { CollectionPagination, CollectionToolbar } from '@/components/collection';
import { useCollection } from '@/core/collection';
import { DataTable } from '@/components/tables';
import type { TableColumnConfig } from '@/components/tables';
import type { Location } from '../../location';
import type { LocationAddress } from '../../locationAddress';

export interface CompanyLocationsSectionProps
{
    locations: Location[];
    /** Address relationships per location id, composed by the page. */
    addressesByLocation?: Record<string, LocationAddress[]>;
    isLoading?: boolean;
    pageSize?: number;
    /** Shared with the other sections so the row lines up. */
    bodyHeight?: number;
    onAddLocation?: () => void;
    onLocationClick?: ( location: Location ) => void;
    realtimeChanges?: Record<string, number>;
}

/** A location with the text of every address it holds, so search reaches addresses. */
type LocationRow = Location & { addressText: string };

/** Typed values are searched, not raw ids or nested objects. */
const SEARCH_KEYS = ['locationType.label', 'label', 'addressText'];

export function CompanyLocationsSection( {
    locations, addressesByLocation, isLoading = false, pageSize = 6, bodyHeight = 320, onAddLocation, onLocationClick,
    realtimeChanges,
}: CompanyLocationsSectionProps )
{
    const { t } = useTranslation();

    const rows = useMemo<LocationRow[]>( () => locations.map( location => ( {
        ...location,
        addressText: ( addressesByLocation?.[location.id] ?? [] )
            .map( relationship => [relationship.address?.line1, relationship.address?.line2, relationship.address?.city,
                relationship.address?.postalCode].filter( Boolean ).join( ' ' ) )
            .join( ' ' ),
    } ) ), [locations, addressesByLocation] );

    // The first address, compactly, with a count of the rest.
    const columns = useMemo<TableColumnConfig<LocationRow>[]>( () => [
        {
            key: 'locationType',
            label: 'tables.location.columns.type',
            type: 'text',
            sortable: true,
            icon: { field: 'locationType.icon', fallback: 'mapPin' },
            render: location => location.locationType ? t( `types.locationType.${location.locationType.label}` ) : undefined,
        },
        { key: 'label', label: 'tables.location.columns.name', type: 'text', sortable: true },
        {
            key: 'address',
            label: 'tables.location.columns.address',
            type: 'text',
            sortable: false,
            render: location =>
            {
                const relationships = addressesByLocation?.[location.id] ?? [];
                const first = relationships[0]?.address;
                if( !first ) return undefined;

                const line = [first.line1, first.city, first.postalCode].filter( Boolean ).join( ', ' );
                const rest = relationships.length - 1;

                return rest > 0 ? `${line} ${t( 'pages.company.location.moreAddresses', { count: rest } )}` : line;
            },
        },
    ], [addressesByLocation, t] );

    const collection = useCollection( rows, { fields: columns, searchKeys: SEARCH_KEYS, pageSize } );

    // No locations at all is an empty state with its own call to action; search, filter and
    // paging only appear once there is something to search, filter or page.
    const isEmpty = !isLoading && locations.length === 0;

    return (
        <ProfileSection
            title={t( 'pages.company.section.location' )}
            action={isEmpty ? undefined : (
                <CollectionToolbar
                    search={collection.search}
                    onSearchChange={collection.setSearch}
                    searchPlaceholder="collection.toolbar.search"
                    actions={
                        <ResponsiveButton
                            variant="outlined"
                            color="primary"
                            size="small"
                            iconKey="plus"
                            label={t( 'pages.company.location.addButton' )}
                            onClick={onAddLocation}
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
            {isEmpty && (
                <EmptyState
                    size="compact"
                    headline={t( 'pages.company.location.emptyState.headline' )}
                    subtext={t( 'pages.company.location.emptyState.subtext' )}
                    actions={onAddLocation
                        ? [{ label: t( 'pages.company.location.addButton' ), variant: 'contained', onClick: onAddLocation }]
                        : []}
                />
            )}

            {!isEmpty && !isLoading && collection.totalCount === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, py: 2 }}>
                    {t( 'collection.noMatches' )}
                </Typography>
            )}

            {!isEmpty && ( isLoading || collection.totalCount > 0 ) && (
                <DataTable<LocationRow>
                    columns={columns}
                    rows={collection.visibleRows}
                    getRowId={location => location.id}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={isLoading}
                    stickyHeader={false}
                    onRowClick={onLocationClick}
                    getRowChangeNonce={realtimeChanges ? location => realtimeChanges[location.id] ?? 0 : undefined}
                />
            )}
        </ProfileSection>
    );
}

export default CompanyLocationsSection;
