/**
 * PageConnections
 *
 * The tools this account pulls measurements from. Selecting a connection opens it beside
 * the collection, where it is tested, pulled on demand, and its run history read.
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
    Box, Button, EmptyState, IconButton, IconRenderer, Menu, MenuItem, ResponsiveButton, Tooltip, Typography,
} from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { CollectionToolbar, CollectionView, CollectionViewToggle, useCollectionViewMode } from '@/components/collection';
import type { CollectionSortOption } from '@/components/collection';
import { useRealtimeChanges } from '@/components/shared/realtime';
import { useCollection } from '@/core/collection';
import { formatApiError, timestampOf } from '@/core/utils';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useConnections } from '../connection/hooks/useConnections';
import { useDeleteConnection } from '../connection/hooks/useDeleteConnection';
import { useTestConnection } from '../connection/hooks/useTestConnection';
import { usePullConnection } from '../connection/hooks/usePullConnection';
import { buildConnectionsTableConfig } from '../connection/config/buildConnectionsTableConfig';
import { ConnectionDialog } from '../connection/components/ConnectionDialog';
import { useConnectorRunsByConnection } from '../connectorRun/hooks/useConnectorRunsByConnection';
import { ConnectorRunList } from '../connectorRun/components/ConnectorRunList';
import type { Connection } from '../connection/types/connection.types';

const CONNECTION_CONFIG = buildConnectionsTableConfig();

const SORT_OPTIONS: CollectionSortOption[] = CONNECTION_CONFIG.columns
    .filter( column => column.sortable )
    .map( ( { key, label } ) => ( { key, label } ) );

/** Pulled-through ranks by time, so a connection that has never pulled sorts oldest. */
const SORT_VALUES = { pulledThrough: ( connection: Connection ) => timestampOf( connection.pulledThrough ) };

/** The selected connection: test, pull, and its runs. */
function ConnectionDetail( { connection }: { connection: Connection } )
{
    const { t } = useTranslation();
    const test = useTestConnection();
    const pull = usePullConnection();
    const { data: runs = [] } = useConnectorRunsByConnection( connection.id );

    const testMessage = test.data
        ? test.data.ok
            ? t( 'pages.connections.testOk' )
            : t( 'pages.connections.testFailed', { message: test.data.message ?? '' } )
        : undefined;

    const error = test.error ?? pull.error;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="outlined"
                    size="small"
                    disabled={test.isPending || pull.isPending}
                    onClick={() => test.mutateAsync( connection.id ).catch( () => undefined )}
                >
                    {t( 'pages.connections.testButton' )}
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    disabled={test.isPending || pull.isPending}
                    onClick={() => pull.mutateAsync( connection.id ).catch( () => undefined )}
                >
                    {t( 'pages.connections.pullButton' )}
                </Button>
            </Box>

            {testMessage && (
                <Typography role="status" color={test.data?.ok ? 'success.main' : 'error'}>{testMessage}</Typography>
            )}

            {error && (
                <Typography role="alert" color="error">{formatApiError( t, error )}</Typography>
            )}

            <Box>
                <Typography variant="overline" color="text.secondary">{t( 'pages.connections.runs' )}</Typography>
                <ConnectorRunList runs={runs} />
            </Box>
        </Box>
    );
}

export function PageConnections()
{
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();

    const { data: connections = [], isLoading, error, refresh } = useConnections();
    const changes = useRealtimeChanges( 'connection' );
    const deleteConnection = useDeleteConnection();

    const [selectedId, setSelectedId] = useState<string>();
    const [viewMode, setViewMode] = useCollectionViewMode( 'connections' );
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [dialog, setDialog] = useState<{ connection: Connection | null } | null>( null );
    const [confirmingDelete, setConfirmingDelete] = useState( false );

    const toggleSelected = ( connection: Connection ) =>
        setSelectedId( previous => previous === connection.id ? undefined : connection.id );

    const selected = connections.find( connection => connection.id === selectedId );

    const collection = useCollection( connections, {
        fields: CONNECTION_CONFIG.columns,
        alphaKey: 'connectorName',
        sortValues: SORT_VALUES,
    } );

    const handleDelete = async () =>
    {
        setConfirmingDelete( false );
        if( !selected ) return;
        await deleteConnection.mutateAsync( selected.id ).catch( () => undefined );
        setSelectedId( undefined );
    };

    const pageError = error ?? deleteConnection.error;

    return (
        <Page title={t( 'pages.connections.title' )} description={t( 'pages.connections.description' )}>
            <NavbarLayout
                title={t( 'pages.connections.title' )}
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
                                    iconKey="plug"
                                    title={selected.label || selected.connectorName}
                                    onEdit={() => setDialog( { connection: selected } )}
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
                                    <ConnectionDetail key={selected.id} connection={selected} />
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
                        searchPlaceholder={t( 'pages.connections.searchPlaceholder' )}
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
                                    label={t( 'pages.connections.addButton' )}
                                    onClick={() => setDialog( { connection: null } )}
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

                <CollectionView<Connection>
                    mode={viewMode}
                    rows={collection.visibleRows}
                    columns={CONNECTION_CONFIG.columns}
                    getRowId={connection => connection.id}
                    selectedRowId={selectedId}
                    onRowClick={toggleSelected}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={isLoading}
                    isEmpty={!error && connections.length === 0}
                    emptyState={
                        <EmptyState
                            icon="plug"
                            headline={t( 'pages.connections.emptyState.headline' )}
                            subtext={t( 'pages.connections.emptyState.subtext' )}
                            actions={[{
                                label: t( 'pages.connections.addButton' ),
                                variant: 'contained',
                                onClick: () => setDialog( { connection: null } ),
                            }]}
                        />
                    }
                    getRowChangeNonce={connection => changes[connection.id] ?? 0}
                />

                <ConnectionDialog
                    open={dialog != null}
                    connection={dialog?.connection ?? null}
                    onClose={() => setDialog( null )}
                    onCreated={setSelectedId}
                />

                <MessageDialog
                    open={confirmingDelete}
                    onClose={() => setConfirmingDelete( false )}
                    title={t( 'pages.connections.deleteConfirm.title' )}
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
                        {t( 'pages.connections.deleteConfirm.body', {
                            name: selected ? selected.label || selected.connectorName : '',
                        } )}
                    </Typography>
                </MessageDialog>
            </NavbarLayout>
        </Page>
    );
}

export default PageConnections;
