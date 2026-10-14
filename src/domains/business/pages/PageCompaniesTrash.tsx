/**
 * PageCompaniesTrash
 *
 * The company trash: deleted companies, read straight from the server with
 * `includeDeleted` rather than the store. Same scaffold as PageCompanies —
 * cards, search, the detail panel — with create/edit dropped and Restore in
 * their place.
 *
 * The panel body is intentionally empty, matching PageCompanies: its slots
 * are not defined yet on the live page either, so trash does not get ahead
 * of it.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { SidePanel } from '@/components/container/SidePanel';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import { Box, EmptyState, IconButton, IconRenderer, Menu, MenuItem, ResponsiveButton, Tooltip } from '@/components/ui';
import { CollectionToolbar, CollectionView, CollectionViewToggle, useCollectionViewMode } from '@/components/collection';
import { useCollection } from '@/core/collection';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import {
    companyService,
    HardDeleteCompanyDialog,
    useDeletedCompanies,
    buildCompaniesTableConfig,
} from '../company';
import { indexPartnershipsByCompany, withCompanyCellRenderers } from '../company/orchestrators/companies.orchestrator';
import type { Company } from '../company';

/** Resolved once — model and state registries are guaranteed loaded by this point. */
const COMPANY_CONFIG = buildCompaniesTableConfig();

const PANEL_MOBILE_WIDTH = '100%';

export function PageCompaniesTrash()
{
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();

    const { data: companies = [], isLoading, refetch } = useDeletedCompanies();

    const [selectedId, setSelectedId] = useState<string>();
    const [viewMode, setViewMode] = useCollectionViewMode( 'partnershipsTrash' );

    /** Restore and permanent delete both live here — a trashed record has no edit. */
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    // One company for a per-card permanent delete, or the whole list for Empty Trash.
    const [hardDeleteTargets, setHardDeleteTargets] = useState<Company[] | null>( null );

    const toggleSelected = ( company: Company ) =>
        setSelectedId( previous => previous === company.id ? undefined : company.id );

    const selected = companies.find( company => company.id === selectedId );

    const handleRestore = async ( company: Company ) =>
    {
        await companyService.restore( company.id );
        setSelectedId( previous => previous === company.id ? undefined : previous );
        void refetch();
    };

    const handleHardDeleted = ( deletedIds: string[] ) =>
    {
        if( selectedId && deletedIds.includes( selectedId ) ) setSelectedId( undefined );
        void refetch();
    };

    // Trash has nothing to search sort or filter against yet beyond name — the collection
    // pipeline still owns search so the toolbar's search box works the same as everywhere else.
    /**
     * A trashed company carries its own partnerships rather than the page holding a
     * shared list, so the renderers read the row they are given.
     */
    const config = useMemo(
        () => withCompanyCellRenderers(
            COMPANY_CONFIG,
            indexPartnershipsByCompany( companies.flatMap( company => company.partnership ?? [] ) ),
        ),
        [companies],
    );

    const collection = useCollection( companies, {
        // The config the orchestrator returned, not the raw one: its derived columns
        // carry the text the search reads, which the stored row does not hold.
        fields: config.columns,
        alphaKey: 'name',
    } );

    return (
        <Page title={t( 'pages.partnerships.trash.title' )} description={t( 'pages.partnerships.trash.description' )}>
            <NavbarLayout
                title={t( 'pages.partnerships.trash.title' )}
                detailPanel={
                    <SidePanel
                        side="right"
                        open={!!selected}
                        size="full"
                        fullWidth={isDesktop ? 500 : PANEL_MOBILE_WIDTH}
                        mode={isDesktop ? 'permanent' : 'temporary'}
                        onClose={() => setSelectedId( undefined )}
                    >
                        {selected && (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* A trashed record has no edit, so the identity zone
                                    carries no pencil. Restore stays visible beside the
                                    menu; the irreversible delete sits inside it. */}
                                <DetailPanelHeader
                                    iconKey="building"
                                    title={selected.name}
                                    actions={
                                        <>
                                            <Tooltip title={t( 'shared.buttons.restore' )}>
                                                <IconButton
                                                    size="small"
                                                    aria-label={t( 'shared.buttons.restore' )}
                                                    onClick={() => handleRestore( selected )}
                                                >
                                                    <IconRenderer iconKey="restore" size={16} />
                                                </IconButton>
                                            </Tooltip>
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
                                        </>
                                    }
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
                                            setHardDeleteTargets( [selected] );
                                        }}
                                        sx={{ color: 'danger.main' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconRenderer iconKey="trashX" size={16} />
                                            {t( 'shared.buttons.deletePermanently' )}
                                        </Box>
                                    </MenuItem>
                                </Menu>

                                {/* Body intentionally empty — matches PageCompanies, whose
                                    detail slots are not defined yet either. */}
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
                        searchPlaceholder={t( 'pages.partnerships.trash.searchPlaceholder' )}
                        actions={
                            <>
                                <CollectionViewToggle mode={viewMode} onModeChange={setViewMode} />
                                <ResponsiveButton
                                    variant="text"
                                    size="small"
                                    iconKey="trashX"
                                    label={t( 'shared.buttons.emptyTrash' )}
                                    onClick={() => setHardDeleteTargets( companies )}
                                    disabled={companies.length === 0}
                                    sx={{ color: 'text.muted' }}
                                />
                                <Tooltip title={t( 'shared.buttons.refresh' )}>
                                    <IconButton
                                        size="medium"
                                        aria-label={t( 'shared.buttons.refresh' )}
                                        onClick={() => refetch()}
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
                            icon="trash"
                            headline={t( 'pages.partnerships.trash.emptyState.headline' )}
                            subtext={t( 'pages.partnerships.trash.emptyState.subtext' )}
                            actions={[]}
                        />
                    }
                />

                <HardDeleteCompanyDialog
                    open={hardDeleteTargets != null}
                    companies={hardDeleteTargets ?? []}
                    onClose={() => setHardDeleteTargets( null )}
                    onDeleted={handleHardDeleted}
                />

            </NavbarLayout>
        </Page>
    );
}

export default PageCompaniesTrash;
