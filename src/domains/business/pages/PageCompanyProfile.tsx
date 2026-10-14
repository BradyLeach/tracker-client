/**
 * PageCompanyProfile
 *
 * Everything we know about one company, on one finite page.
 *
 * The page never grows: each section is a self-contained container that pages
 * its own history, so reaching a comment from six months ago does not lengthen
 * the profile or disturb anything else on it.
 *
 * Composition only. Every section is a component taking data as props, so the
 * quick-detail panel can later render the same ones as a compact projection
 * rather than a second, separately designed source of company information.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { SidePanel } from '@/components/container/SidePanel';
import { PROFILE_SECTION_FOOTER_HEIGHT } from '@/components/container/ProfileSection';
import { Box, Skeleton } from '@/components/ui';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import {
    CompanyCommentsPanel,
    CompanyCommentsSection,
    CompanyLocationsSection,
    CompanyPartnersSection,
    CompanyProfileHeader,
    DeleteCompanyDialog,
    EditCompanyDialog,
    useCompany,
} from '../company';
import { LocationDialog, useLocationsByCompany } from '../location';
import { useLocationAddressesByLocations } from '../locationAddress';
import type { LocationAddress } from '../locationAddress';
import { useRealtimeChanges } from '@/components/shared/realtime';
import { usePartnerships } from '../partnership/hooks/usePartnerships';
import { CreatePartnershipDialog } from '../partnership/components/CreatePartnershipDialog';

/**
 * Paired sections share a row on wide screens and stack below — Locations with
 * Partners. Intrinsic rather than breakpoint-driven, so a
 * pair reflows to the space it is given.
 */
const PAIR_COLUMNS = 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))';

/**
 * One body height for every section that pages.
 *
 * Sections sizing themselves independently is what left the map short beside
 * Partners; a shared value also means a short final page cannot shrink a
 * section and jerk the page below it.
 */
const SECTION_BODY_HEIGHT = 320;

export function PageCompanyProfile()
{
    const { t } = useTranslation();
    const { companyId } = useParams<{ companyId: string }>();
    const isDesktop = useIsDesktop();

    // The conversation is either in the page or in the panel, never both.
    const [commentsOpen, setCommentsOpen] = useState( false );
    const [editing, setEditing] = useState( false );
    const [confirmingDelete, setConfirmingDelete] = useState( false );
    const [creatingLocation, setCreatingLocation] = useState( false );
    const [editingLocationId, setEditingLocationId] = useState<string | null>( null );
    const [creatingPartnership, setCreatingPartnership] = useState( false );
    const [editingPartnershipId, setEditingPartnershipId] = useState<string | null>( null );

    const navigate = useNavigate();
    const { data: company } = useCompany( companyId ?? null );
    const locationChanges = useRealtimeChanges( 'location' );
    const locationAddressChanges = useRealtimeChanges( 'locationAddress' );
    const partnershipChanges = useRealtimeChanges( 'partnership' );

    // One query per area, so a slow or missing endpoint cannot block the page.
    const { data: locations = [], isLoading: locationsLoading } = useLocationsByCompany( companyId );
    // Each location's addresses come from the LocationAddress domain, grouped here for the table.
    const locationIds = useMemo( () => locations.map( location => location.id ), [locations] );
    const { data: locationAddresses = [] } = useLocationAddressesByLocations( locationIds );
    const addressesByLocation = useMemo( () =>
    {
        const grouped: Record<string, LocationAddress[]> = {};
        for( const relationship of locationAddresses )
        {
            ( grouped[relationship.locationId] ??= [] ).push( relationship );
        }
        return grouped;
    }, [locationAddresses] );

    // A location row reflects changes to its own record and to its address relationships.
    const locationRowChanges = useMemo( () =>
    {
        const merged: Record<string, number> = { ...locationChanges };
        for( const relationship of locationAddresses )
        {
            const nonce = locationAddressChanges[relationship.id];
            if( nonce ) merged[relationship.locationId] = ( merged[relationship.locationId] ?? 0 ) + nonce;
        }
        return merged;
    }, [locationChanges, locationAddressChanges, locationAddresses] );

    // Partnerships come from the partnership list and are scoped by companyId,
    // the same way the companies page and the grouped table already do it.
    const { data: allPartnerships = [] } = usePartnerships();
    const partnerships = useMemo(
        () => allPartnerships.filter( partnership => partnership.companyId === companyId ),
        [allPartnerships, companyId],
    );

    return (
        <Page
            title={company?.name ?? t( 'pages.company.title' )}
            description={t( 'pages.company.description' )}
        >
            {/* Static: the top bar says where you are, the profile header below
                says who this is. Both showing the company name is a duplicate. */}
            <NavbarLayout
                title={t( 'pages.company.overview' )}
                detailPanel={
                    <SidePanel
                        side="right"
                        open={commentsOpen && !!companyId}
                        size="full"
                        // Below md the panel is an overlay; a half-width flap
                        // over the profile reads as broken, so it takes the
                        // screen.
                        fullWidth={isDesktop ? 460 : '100%'}
                        mode={isDesktop ? 'permanent' : 'temporary'}
                        onClose={() => setCommentsOpen( false )}
                    >
                        {companyId && commentsOpen && (
                            <CompanyCommentsPanel
                                companyId={companyId}
                                title={company?.name ?? t( 'pages.company.section.comment' )}
                                onClose={() => setCommentsOpen( false )}
                            />
                        )}
                    </SidePanel>
                }
            >

                {/* The structure renders whatever the data does. Each section
                    owns its own loading and empty state, so a slow or missing
                    endpoint hides that section's content — never the page. */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {company
                        ? <CompanyProfileHeader company={company} partnerships={partnerships} onEdit={() => setEditing( true )}
                            onDelete={() => setConfirmingDelete( true )} />
                        : <Skeleton variant="rectangular" height={112} sx={{ borderRadius: 1 }} />
                    }

                    <Box sx={{ display: 'grid', gridTemplateColumns: PAIR_COLUMNS, gap: 3, alignItems: 'start' }}>
                        <CompanyLocationsSection
                            locations={locations}
                            addressesByLocation={addressesByLocation}
                            isLoading={locationsLoading}
                            bodyHeight={SECTION_BODY_HEIGHT}
                            onAddLocation={() => setCreatingLocation( true )}
                            onLocationClick={location => setEditingLocationId( location.id )}
                            realtimeChanges={locationRowChanges}
                        />
                        <CompanyPartnersSection
                            partnerships={partnerships}
                            bodyHeight={SECTION_BODY_HEIGHT}
                            onAddPartnership={() => setCreatingPartnership( true )}
                            onEditPartnership={partnership => setEditingPartnershipId( partnership.id )}
                            realtimeChanges={partnershipChanges}
                        />
                    </Box>

                    {/* The conversation lives in one place at a time: with
                        the panel open the section leaves the flow.

                        Comments pages inside its own body rather than in a
                        section footer, so it absorbs the footer's height to
                        match the paging sections above. */}
                    {companyId && !commentsOpen && (
                        <CompanyCommentsSection
                            companyId={companyId}
                            bodyHeight={SECTION_BODY_HEIGHT + PROFILE_SECTION_FOOTER_HEIGHT}
                            onExpand={() => setCommentsOpen( true )}
                        />
                    )}

                </Box>

                <LocationDialog
                    open={creatingLocation || editingLocationId != null}
                    onClose={() => { setCreatingLocation( false ); setEditingLocationId( null ); }}
                    location={editingLocationId ? locations.find( location => location.id === editingLocationId ) ?? null : null}
                    defaultCompanyId={companyId}
                />

                <CreatePartnershipDialog
                    open={creatingPartnership || editingPartnershipId != null}
                    onClose={() => { setCreatingPartnership( false ); setEditingPartnershipId( null ); }}
                    partnership={editingPartnershipId
                        ? partnerships.find( partnership => partnership.id === editingPartnershipId ) ?? null
                        : null}
                    companyId={companyId}
                />

                <EditCompanyDialog
                    open={editing}
                    company={company ?? null}
                    onClose={() => setEditing( false )}
                />

                <DeleteCompanyDialog
                    open={confirmingDelete}
                    onClose={() => setConfirmingDelete( false )}
                    company={company ?? null}
                    onDeleted={() => navigate( '/partnerships' )}
                />

            </NavbarLayout>
        </Page>
    );
}

export default PageCompanyProfile;
