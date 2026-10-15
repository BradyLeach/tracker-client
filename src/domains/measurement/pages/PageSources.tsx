/**
 * PageSources
 *
 * Where the account's measurements come from, and what each source may send. Selecting a
 * source opens its allowed sets and recent measurements beside the collection, and
 * measurements can be entered there by hand.
 *
 * Composition only — every part is a component with its own playground:
 *
 *     CollectionToolbar   search, sort and page actions
 *     CollectionView      the collection as cards or a table
 *     DetailPanelHeader   the panel's fixed top row
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { SidePanel } from '@/components/container/SidePanel';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import {
    Box, Button, Chip, EmptyState, IconButton, IconRenderer, Menu, MenuItem, ResponsiveButton, Tooltip, Typography,
} from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { CollectionToolbar, CollectionView, CollectionViewToggle, useCollectionViewMode } from '@/components/collection';
import type { CollectionSortOption } from '@/components/collection';
import { useRealtimeChanges } from '@/components/shared/realtime';
import { useCollection } from '@/core/collection';
import { formatApiError } from '@/core/utils';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useMeasurementSources } from '../measurementSource/hooks/useMeasurementSources';
import { useDeleteMeasurementSource } from '../measurementSource/hooks/useDeleteMeasurementSource';
import { buildMeasurementSourcesTableConfig } from '../measurementSource/config/buildMeasurementSourcesTableConfig';
import { sourceName, withMeasurementSourceCellRenderers } from '../measurementSource/orchestrators/measurementSources.orchestrator';
import { MeasurementSourceDialog } from '../measurementSource/components/MeasurementSourceDialog';
import { useMeasurementsBySource } from '../measurement/hooks/useMeasurementsBySource';
import { useDeleteMeasurement } from '../measurement/hooks/useDeleteMeasurement';
import { MeasurementList } from '../measurement/components/MeasurementList';
import { ManualEntryDialog } from '../measurement/components/ManualEntryDialog';
import type { MeasurementSource } from '../measurementSource/types/measurementSource.types';

const SOURCE_CONFIG = withMeasurementSourceCellRenderers( buildMeasurementSourcesTableConfig() );

const SORT_OPTIONS: CollectionSortOption[] = SOURCE_CONFIG.columns
    .filter( column => column.sortable )
    .map( ( { key, label } ) => ( { key, label } ) );

/** One allowed set as chips, or a dash when it is empty. */
function AllowedSet( { title, values }: { title: string; values: string[] } )
{
    return (
        <Box>
            <Typography variant="overline" color="text.secondary">{title}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {values.length
                    ? values.map( value => <Chip key={value} size="small" label={value} /> )
                    : <Typography variant="body2" color="text.secondary">—</Typography>}
            </Box>
        </Box>
    );
}

/** The selected source: what it may send, and what it has sent lately. */
function SourceDetail( { source, onEnter }: { source: MeasurementSource; onEnter: () => void } )
{
    const { t } = useTranslation();
    const { data: measurements = [] } = useMeasurementsBySource( source.id );
    const deleteMeasurement = useDeleteMeasurement();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AllowedSet
                title={t( 'forms.measurementSource.fields.allowedMeasurementNames' )}
                values={source.allowedMeasurementNames}
            />
            <AllowedSet title={t( 'forms.measurementSource.fields.allowedDimensionKeys' )} values={source.allowedDimensionKeys} />

            <Box>
                <Button variant="contained" size="small" onClick={onEnter} disabled={source.allowedMeasurementNames.length === 0}>
                    {t( 'pages.sources.enterButton' )}
                </Button>
            </Box>

            {deleteMeasurement.error && (
                <Typography role="alert" color="error">{formatApiError( t, deleteMeasurement.error )}</Typography>
            )}

            <Box>
                <Typography variant="overline" color="text.secondary">{t( 'pages.sources.measurements' )}</Typography>
                <MeasurementList
                    measurements={measurements}
                    onDelete={measurement => deleteMeasurement.mutateAsync( measurement.id ).catch( () => undefined )}
                />
            </Box>
        </Box>
    );
}

export function PageSources()
{
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();

    const { data: sources = [], isLoading, error, refresh } = useMeasurementSources();
    const changes = useRealtimeChanges( 'measurementSource' );
    const deleteSource = useDeleteMeasurementSource();

    const [selectedId, setSelectedId] = useState<string>();
    const [viewMode, setViewMode] = useCollectionViewMode( 'sources' );
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [dialog, setDialog] = useState<{ source: MeasurementSource | null } | null>( null );
    const [entering, setEntering] = useState( false );
    const [confirmingDelete, setConfirmingDelete] = useState( false );

    const toggleSelected = ( source: MeasurementSource ) =>
        setSelectedId( previous => previous === source.id ? undefined : source.id );

    const selected = sources.find( source => source.id === selectedId );

    const collection = useCollection( sources, { fields: SOURCE_CONFIG.columns, alphaKey: 'key' } );

    const handleDelete = async () =>
    {
        setConfirmingDelete( false );
        if( !selected ) return;
        await deleteSource.mutateAsync( selected.id ).catch( () => undefined );
        setSelectedId( undefined );
    };

    const pageError = error ?? deleteSource.error;

    return (
        <Page title={t( 'pages.sources.title' )} description={t( 'pages.sources.description' )}>
            <NavbarLayout
                title={t( 'pages.sources.title' )}
                detailPanel={
                    <SidePanel
                        side="right"
                        open={!!selected}
                        size="full"
                        fullWidth={isDesktop ? 500 : '100%'}
                        mode={isDesktop ? 'permanent' : 'temporary'}
                        onClose={() => setSelectedId( undefined )}
                    >
                        {selected && (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <DetailPanelHeader
                                    iconKey="database"
                                    title={sourceName( selected )}
                                    onEdit={() => setDialog( { source: selected } )}
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
                                    onClose={() => setSelectedId( undefined )}
                                />

                                <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor( null )}>
                                    <MenuItem
                                        onClick={() =>
                                        {
                                            setMenuAnchor( null );
                                            setConfirmingDelete( true );
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
                                    <SourceDetail key={selected.id} source={selected} onEnter={() => setEntering( true )} />
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
                        searchPlaceholder={t( 'pages.sources.searchPlaceholder' )}
                        sortOptions={SORT_OPTIONS}
                        sortKey={collection.sortKey}
                        sortDir={collection.sortDir}
                        onSortChange={collection.toggleSort}
                        actions={
                            <>
                                <CollectionViewToggle mode={viewMode} onModeChange={setViewMode} />
                                <ResponsiveButton
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    iconKey="plus"
                                    label={t( 'pages.sources.addButton' )}
                                    onClick={() => setDialog( { source: null } )}
                                />
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

                {pageError && (
                    <Typography role="alert" color="error" sx={{ mb: 2 }}>
                        {formatApiError( t, pageError )}
                    </Typography>
                )}

                <CollectionView<MeasurementSource>
                    mode={viewMode}
                    rows={collection.visibleRows}
                    columns={SOURCE_CONFIG.columns}
                    getRowId={source => source.id}
                    selectedRowId={selectedId}
                    onRowClick={toggleSelected}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={isLoading}
                    isEmpty={!error && sources.length === 0}
                    emptyState={
                        <EmptyState
                            icon="database"
                            headline={t( 'pages.sources.emptyState.headline' )}
                            subtext={t( 'pages.sources.emptyState.subtext' )}
                            actions={[{
                                label: t( 'pages.sources.addButton' ),
                                variant: 'contained',
                                onClick: () => setDialog( { source: null } ),
                            }]}
                        />
                    }
                    getRowChangeNonce={source => changes[source.id] ?? 0}
                />

                <MeasurementSourceDialog
                    open={dialog != null}
                    source={dialog?.source ?? null}
                    onClose={() => setDialog( null )}
                    onCreated={setSelectedId}
                />

                <ManualEntryDialog open={entering} source={selected ?? null} onClose={() => setEntering( false )} />

                <MessageDialog
                    open={confirmingDelete}
                    onClose={() => setConfirmingDelete( false )}
                    title={t( 'pages.sources.deleteConfirm.title' )}
                    actions={
                        <>
                            <Button onClick={() => setConfirmingDelete( false )} variant="text">
                                {t( 'shared.buttons.cancel' )}
                            </Button>
                            <Button onClick={handleDelete} variant="contained" color="error">
                                {t( 'shared.buttons.delete' )}
                            </Button>
                        </>
                    }
                >
                    <Typography>
                        {t( 'pages.sources.deleteConfirm.body', { name: selected ? sourceName( selected ) : '' } )}
                    </Typography>
                </MessageDialog>
            </NavbarLayout>
        </Page>
    );
}

export default PageSources;
