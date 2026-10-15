/**
 * PageExperiments
 *
 * The experiment collection. Cards or table rows; selecting one opens the detail
 * panel beside them, and expanding it opens the experiment page where variants,
 * measures and results are worked.
 *
 * Composition only — every part is a component with its own playground:
 *
 *     CollectionToolbar   search, sort, status facet and page actions
 *     CollectionView      the collection as cards or a table
 *     DetailPanelHeader   the panel's fixed top row
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { SidePanel } from '@/components/container/SidePanel';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import { Box, EmptyState, IconButton, IconRenderer, Menu, MenuItem, ResponsiveButton, Tooltip, Typography } from '@/components/ui';
import { CollectionToolbar, CollectionView, CollectionViewToggle, useCollectionViewMode } from '@/components/collection';
import type { CollectionSortOption } from '@/components/collection';
import { useRealtimeChanges } from '@/components/shared/realtime';
import { useCollection } from '@/core/collection';
import { formatApiError } from '@/core/utils';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useExperiments } from '../experiment/hooks/useExperiments';
import { buildExperimentsTableConfig } from '../experiment/config/buildExperimentsTableConfig';
import {
    buildExperimentFilters,
    EXPERIMENT_SORT_VALUES,
    withExperimentCellRenderers,
} from '../experiment/orchestrators/experiments.orchestrator';
import { ExperimentDialog } from '../experiment/components/ExperimentDialog';
import { DeleteExperimentDialog } from '../experiment/components/DeleteExperimentDialog';
import type { Experiment } from '../experiment/types/experiment.types';

/**
 * One definition for the collection: the table renders a cell per column, the card
 * reads each column's `card` slot, and the pipeline searches and sorts the same keys.
 * Resolved once — the model and state registries are loaded by this point.
 */
const EXPERIMENT_CONFIG = withExperimentCellRenderers( buildExperimentsTableConfig() );

/**
 * Sort choices come from the column config's own `sortable` flags, so the toolbar
 * cannot offer a sort the config does not declare, and labels are not written twice.
 */
const SORT_OPTIONS: CollectionSortOption[] = EXPERIMENT_CONFIG.columns
    .filter( column => column.sortable )
    .map( ( { key, label } ) => ( { key, label } ) );

export function PageExperiments()
{
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();

    const { data: experiments = [], isLoading, error, refresh } = useExperiments();
    const changes = useRealtimeChanges( 'experiment' );

    const [selectedId, setSelectedId] = useState<string>();
    const [viewMode, setViewMode] = useCollectionViewMode( 'experiments' );

    /** The slide-over's secondary actions. Edit is visible beside it, not in here. */
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [createOpen, setCreateOpen] = useState( false );
    const [editingExperiment, setEditingExperiment] = useState<Experiment | null>( null );
    const [deletingExperiment, setDeletingExperiment] = useState<Experiment | null>( null );

    /** Clicking the open card closes it, matching the nav rail's active item. */
    const toggleSelected = ( experiment: Experiment ) =>
        setSelectedId( previous => previous === experiment.id ? undefined : experiment.id );

    const selected = experiments.find( experiment => experiment.id === selectedId );

    /** Status facet, from the states the loaded experiments are in. */
    const { filters, filterOptions } = useMemo( () => buildExperimentFilters( experiments ), [experiments] );

    // Search, filtering and sorting are one data operation; the view below only
    // renders what the pipeline returns.
    const collection = useCollection( experiments, {
        fields: EXPERIMENT_CONFIG.columns,
        alphaKey: 'title',
        filters,
        sortValues: EXPERIMENT_SORT_VALUES,
    } );

    return (
        <Page title={t( 'pages.experiments.title' )} description={t( 'pages.experiments.description' )}>
            <NavbarLayout
                title={t( 'pages.experiments.title' )}
                detailPanel={
                    <SidePanel
                        side="right"
                        open={!!selected}
                        size="full"
                        // Below md the panel is an overlay; a half-width flap over the grid
                        // reads as broken, so it takes the screen.
                        fullWidth={isDesktop ? 500 : '100%'}
                        mode={isDesktop ? 'permanent' : 'temporary'}
                        onClose={() => setSelectedId( undefined )}
                    >
                        {selected && (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* The panel is where a record is acted on: edit sits
                                    with the identity, the rest behind the menu. */}
                                <DetailPanelHeader
                                    iconKey="flask"
                                    title={selected.title}
                                    onEdit={() => setEditingExperiment( selected )}
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
                                    onExpand={() => navigate( `/experiments/${selected.id}` )}
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
                                            setDeletingExperiment( selected );
                                        }}
                                        sx={{ color: 'danger.main' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconRenderer iconKey="trash" size={16} />
                                            {t( 'shared.buttons.delete' )}
                                        </Box>
                                    </MenuItem>
                                </Menu>

                                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
                                    <Typography variant="overline" color="text.secondary">
                                        {t( 'pages.experiment.design.hypothesis' )}
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selected.hypothesis}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </SidePanel>
                }
            >

                <Box sx={{ mb: 2 }}>
                    <CollectionToolbar
                        search={collection.search}
                        onSearchChange={collection.setSearch}
                        searchPlaceholder={t( 'pages.experiments.searchPlaceholder' )}
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
                                    label={t( 'pages.experiments.addButton' )}
                                    onClick={() => setCreateOpen( true )}
                                />
                                {/* A repeatable, same-screen utility action rather than a
                                    destination — icon-only reads correctly here. */}
                                <Tooltip title={t( 'shared.buttons.refresh' )}>
                                    <IconButton
                                        aria-label={t( 'shared.buttons.refresh' )}
                                        onClick={refresh}
                                        sx={{ color: 'text.muted' }}
                                    >
                                        <IconRenderer iconKey="refresh" size={18} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        }
                    />
                </Box>

                {error && (
                    <Typography role="alert" color="error" sx={{ mb: 2 }}>
                        {formatApiError( t, error )}
                    </Typography>
                )}

                <CollectionView<Experiment>
                    mode={viewMode}
                    rows={collection.visibleRows}
                    columns={EXPERIMENT_CONFIG.columns}
                    getRowId={experiment => experiment.id}
                    selectedRowId={selectedId}
                    onRowClick={toggleSelected}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={isLoading}
                    isEmpty={!error && experiments.length === 0}
                    emptyState={
                        <EmptyState
                            icon="flask"
                            headline={t( 'pages.experiments.emptyState.headline' )}
                            subtext={t( 'pages.experiments.emptyState.subtext' )}
                            actions={[
                                {
                                    label: t( 'pages.experiments.emptyState.addButton' ),
                                    variant: 'contained',
                                    onClick: () => setCreateOpen( true ),
                                },
                            ]}
                        />
                    }
                    getRowChangeNonce={experiment => changes[experiment.id] ?? 0}
                />

                <ExperimentDialog
                    open={createOpen || editingExperiment != null}
                    experiment={editingExperiment}
                    onClose={() => { setCreateOpen( false ); setEditingExperiment( null ); }}
                    // A new experiment opens in the panel; its variants and measures are
                    // added on the experiment page, one click away.
                    onCreated={setSelectedId}
                />

                <DeleteExperimentDialog
                    open={deletingExperiment != null}
                    experiment={deletingExperiment}
                    onClose={() => setDeletingExperiment( null )}
                    onDeleted={( experiment ) => setSelectedId( previous => previous === experiment.id ? undefined : previous )}
                />

            </NavbarLayout>
        </Page>
    );
}

export default PageExperiments;
