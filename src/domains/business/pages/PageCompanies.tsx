/**
 * PageCompanies
 *
 * The company collection. Cards rather than table rows; selecting one opens
 * the detail panel beside them.
 *
 * Composition only — every part is a component with its own playground:
 *
 *     CollectionToolbar   search, sort and page actions
 *     CollectionView      the collection as cards or a table
 *     DetailPanelHeader   the panel's fixed top row
 *
 * The panel body is deliberately empty. Its slots are defined next, and the
 * full company profile page after that.
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { SidePanel } from '@/components/container/SidePanel';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import { Box, EmptyState, IconButton, IconRenderer, Menu, MenuItem, ResponsiveButton, Tooltip } from '@/components/ui';
import { CollectionToolbar, CollectionView, CollectionViewToggle, useCollectionViewMode } from '@/components/collection';
import { useRealtimeChanges } from '@/components/shared/realtime';
import type { CollectionSortOption } from '@/components/collection';
import { useCollection } from '@/core/collection';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { typeCatalogue } from '@/domains/system';
import {
    DeleteCompanyDialog,
    EditCompanyDialog,
    useCompanies,
    buildCompaniesTableConfig,
} from '../company';
import {
    buildCompanyFilters,
    indexPartnershipsByCompany,
    withCompanyCellRenderers,
} from '../company/orchestrators/companies.orchestrator';
import type { Company } from '../company';
import { usePartnerships } from '../partnership/hooks/usePartnerships';
import { CreatePartnershipDialog } from '../partnership/components/CreatePartnershipDialog';

/** Resolved once — model and state registries are guaranteed loaded by this point. */
const COMPANY_CONFIG = buildCompaniesTableConfig();

/**
 * Sort choices come from the column config's own `sortable` flags, so the
 * toolbar cannot offer a sort the config does not declare, and labels are not
 * written twice. Cards have no headers to click, so this is the only control.
 */
const SORT_OPTIONS: CollectionSortOption[] = COMPANY_CONFIG.columns
    .filter( column => column.sortable )
    .map( ( { key, label } ) => ( { key, label } ) );

/**
 * Below `md` the panel takes the whole screen rather than overlaying part of
 * it. `md` is where the push layout stops fitting a card beside the panel
 * (rail + panel + minimum card ≈ 900px), so below it the record is the screen,
 * not a flap over a grid the user can no longer use.
 */
const PANEL_MOBILE_WIDTH = '100%';

export function PageCompanies()
{
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Below the breakpoint the detail panel becomes a dismissible overlay
    // rather than splitting the width — the same handoff the nav rail makes.
    const isDesktop = useIsDesktop();

    const { data: companies = [], isLoading, refresh: refreshCompanies } = useCompanies();
    const { data: partnerships = [], refresh: refreshPartnerships } = usePartnerships();

    // Both collections this screen reads, discarded and loaded again from the server —
    // authoritative rather than trusting whatever the store already has satisfied.
    const refreshPage = () =>
    {
        refreshCompanies();
        refreshPartnerships();
    };

    /**
     * One counter per company, bumped each time realtime reports that company changed.
     * A card absent from the map has never changed, so it reads as 0 and does not trace.
     */
    const realtimeChanges = useRealtimeChanges( 'company' );

    const [selectedId, setSelectedId] = useState<string>();
    const [viewMode, setViewMode] = useCollectionViewMode( 'partnerships' );

    /** The slide-over's secondary actions. Edit is visible beside it, not in here. */
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [createPartnershipOpen, setCreatePartnershipOpen] = useState( false );
    const [editingCompany, setEditingCompany] = useState<Company | null>( null );
    const [deletingCompany, setDeletingCompany] = useState<Company | null>( null );

    /** Clicking the open card closes it, matching the nav rail's active item. */
    const toggleSelected = ( company: Company ) =>
        setSelectedId( previous => previous === company.id ? undefined : company.id );

    const selected = companies.find( company => company.id === selectedId );

    /** One pass over partnerships, read by both the filters and the cell renderers. */
    const partnershipsByCompany = useMemo(
        () => indexPartnershipsByCompany( partnerships ),
        [partnerships],
    );

    // A company card shows its partnerships, so a partnership change traces the card too.
    const partnershipChanges = useRealtimeChanges( 'partnership' );
    const companyCardChanges = useMemo( () =>
    {
        const merged: Record<string, number> = { ...realtimeChanges };
        for( const partnership of partnerships )
        {
            const nonce = partnershipChanges[partnership.id];
            if( nonce ) merged[partnership.companyId] = ( merged[partnership.companyId] ?? 0 ) + nonce;
        }
        return merged;
    }, [realtimeChanges, partnershipChanges, partnerships] );

    /** Status and type facets, both derived from the partnerships the page holds. */
    const { filters, filterOptions } = useMemo(
        () => buildCompanyFilters( partnerships, partnershipsByCompany, typeCatalogue ),
        [partnerships, partnershipsByCompany],
    );

    /**
     * The badge and status cells read the hydrated partnerships, so the renderers
     * are applied here rather than in the config, which stays pure data.
     */
    const config = useMemo(
        () => withCompanyCellRenderers( COMPANY_CONFIG, partnershipsByCompany ),
        [partnershipsByCompany],
    );

    // Search, filtering and sorting are one data operation; the view below only
    // renders what the pipeline returns.
    const collection = useCollection( companies, {
        // The config the orchestrator returned, not the raw one: its derived columns
        // carry the text the search reads, which the stored row does not hold.
        fields: config.columns,
        alphaKey: 'name',
        filters,
    } );

    return (
        <Page title={t( 'pages.partnerships.title' )} description={t( 'pages.partnerships.description' )}>
            <NavbarLayout
                title={t( 'pages.partnerships.title' )}
                detailPanel={
                    <SidePanel
                        side="right"
                        open={!!selected}
                        size="full"
                        // Below md the panel is an overlay; a half-width flap over the grid
                        // reads as broken, so it takes the screen.
                        fullWidth={isDesktop ? 500 : PANEL_MOBILE_WIDTH}
                        mode={isDesktop ? 'permanent' : 'temporary'}
                        onClose={() => setSelectedId( undefined )}
                    >
                        {selected && (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* The panel is where a record is acted on: edit sits
                                    with the identity, the rest behind the menu. A card
                                    carries no actions of its own, so there is one place
                                    to find them. */}
                                <DetailPanelHeader
                                    iconKey="building"
                                    title={selected.name}
                                    onEdit={() => setEditingCompany( selected )}
                                    actions={
                                        <Tooltip title={t( 'shared.buttons.moreActions' )}>
                                            <IconButton
                                                size="small"
                                                aria-label={t( 'shared.buttons.moreActions' )}
                                                aria-haspopup="true"
                                                aria-expanded={menuAnchor ? 'true' : undefined}
                                                onClick={( event ) => setMenuAnchor( event.currentTarget )}
                                            >
                                                <IconRenderer iconKey="dotsVertical" size={16} />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    onExpand={() => navigate( `/partnerships/${selected.id}` )}
                                    onClose={() => setSelectedId( undefined )}
                                />

                                <Menu
                                    anchorEl={menuAnchor}
                                    open={!!menuAnchor}
                                    onClose={() => setMenuAnchor( null )}
                                >
                                    <MenuItem
                                        onClick={() =>
                                        {
                                            setMenuAnchor( null );
                                            setDeletingCompany( selected );
                                        }}
                                        sx={{ color: 'danger.main' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconRenderer iconKey="trash" size={16} />
                                            {t( 'shared.buttons.delete' )}
                                        </Box>
                                    </MenuItem>
                                </Menu>

                                {/* Body intentionally empty until the detail slots
                                    are defined. */}
                                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }} />
                            </Box>
                        )}
                    </SidePanel>
                }
            >

                <Box sx={{ mb: 2 }}>
                    <CollectionToolbar
                        search={collection.search}
                        onSearchChange={collection.setSearch}
                        searchPlaceholder={t( 'pages.partnerships.searchPlaceholder' )}
                        sortOptions={SORT_OPTIONS}
                        sortKey={collection.sortKey}
                        sortDir={collection.sortDir}
                        onSortChange={collection.toggleSort}
                        filterOptions={filterOptions}
                        activeFilterKeys={collection.activeFilterKeys}
                        onFilterToggle={collection.toggleFilter}
                        actions={
                            <>
                                <CollectionViewToggle mode={viewMode} onModeChange={setViewMode} />
                                <ResponsiveButton
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    iconKey="plus"
                                    label={t( 'pages.partnerships.addButton' )}
                                    onClick={() => setCreatePartnershipOpen( true )}
                                />
                                {/* Tertiary to Add Partner — text variant is transparent with
                                    no border, muted so it does not compete with the primary
                                    action, but keeps its label: this navigates to a whole other
                                    view, not a same-screen action, so icon-only would cost
                                    discoverability an icon-only destructive-action button
                                    would not. */}
                                <ResponsiveButton
                                    variant="text"
                                    size="small"
                                    iconKey="trash"
                                    label={t( 'shared.buttons.viewTrash' )}
                                    onClick={() => navigate( '/partnerships/trash' )}
                                    sx={{ color: 'text.muted' }}
                                />
                                {/* A repeatable, same-screen utility action rather than a
                                    destination — icon-only reads correctly here the way it
                                    would not for View Trash. */}
                                <Tooltip title={t( 'shared.buttons.refresh' )}>
                                    <IconButton
                                        size="medium"
                                        aria-label={t( 'shared.buttons.refresh' )}
                                        onClick={refreshPage}
                                        sx={{ color: 'text.muted' }}
                                    >
                                        <IconRenderer iconKey="refresh" size={18} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        }
                    />
                </Box>

                <CollectionView<Company>
                    mode={viewMode}
                    rows={collection.visibleRows}
                    columns={config.columns}
                    getRowId={company => company.id}
                    selectedRowId={selectedId}
                    onRowClick={toggleSelected}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={isLoading}
                    isEmpty={companies.length === 0}
                    emptyState={
                        <EmptyState
                            icon="buildingWarehouse"
                            headline={t( 'pages.partnerships.emptyState.headline' )}
                            subtext={t( 'pages.partnerships.emptyState.subtext' )}
                            actions={[
                                {
                                    label: t( 'pages.partnerships.emptyState.addButton' ),
                                    variant: 'contained',
                                    onClick: () => setCreatePartnershipOpen( true ),
                                },
                            ]}
                        />
                    }
                    getRowChangeNonce={company => companyCardChanges[company.id] ?? 0}
                />

                <CreatePartnershipDialog
                    open={createPartnershipOpen}
                    onClose={() => setCreatePartnershipOpen( false )}
                />

                <EditCompanyDialog
                    open={editingCompany != null}
                    company={editingCompany}
                    onClose={() => setEditingCompany( null )}
                />

                <DeleteCompanyDialog
                    open={deletingCompany != null}
                    company={deletingCompany}
                    onClose={() => setDeletingCompany( null )}
                    onDeleted={( company ) => setSelectedId( previous => previous === company.id ? undefined : previous )}
                />

            </NavbarLayout>
        </Page>
    );
}
