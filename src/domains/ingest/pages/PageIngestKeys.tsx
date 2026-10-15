/**
 * PageIngestKeys
 *
 * The keys websites, apps and servers push events with. Selecting a key opens it beside
 * the collection, where it is revoked — at once and for good — or deleted.
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
import { formatApiError, timestampOf } from '@/core/utils';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useIngestKeys } from '../ingestKey/hooks/useIngestKeys';
import { useRevokeIngestKey } from '../ingestKey/hooks/useRevokeIngestKey';
import { useDeleteIngestKey } from '../ingestKey/hooks/useDeleteIngestKey';
import { buildIngestKeysTableConfig } from '../ingestKey/config/buildIngestKeysTableConfig';
import { withIngestKeyCellRenderers } from '../ingestKey/orchestrators/ingestKeys.orchestrator';
import { IngestKeyDialog } from '../ingestKey/components/IngestKeyDialog';
import type { IngestKey } from '../ingestKey/types/ingestKey.types';

const INGEST_KEY_CONFIG = withIngestKeyCellRenderers( buildIngestKeysTableConfig() );

const SORT_OPTIONS: CollectionSortOption[] = INGEST_KEY_CONFIG.columns
    .filter( column => column.sortable )
    .map( ( { key, label } ) => ( { key, label } ) );

/** Revocation ranks by time, so a live key sorts as never revoked. */
const SORT_VALUES = { revokedAt: ( ingestKey: IngestKey ) => timestampOf( ingestKey.revokedAt ) };

type Confirming = 'revoke' | 'delete';

export function PageIngestKeys()
{
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();

    const { data: ingestKeys = [], isLoading, error, refresh } = useIngestKeys();
    const changes = useRealtimeChanges( 'ingestKey' );
    const revoke = useRevokeIngestKey();
    const deleteKey = useDeleteIngestKey();

    const [selectedId, setSelectedId] = useState<string>();
    const [viewMode, setViewMode] = useCollectionViewMode( 'ingestKeys' );
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>( null );
    const [dialog, setDialog] = useState<{ ingestKey: IngestKey | null } | null>( null );
    const [confirming, setConfirming] = useState<Confirming>();

    const toggleSelected = ( ingestKey: IngestKey ) =>
        setSelectedId( previous => previous === ingestKey.id ? undefined : ingestKey.id );

    const selected = ingestKeys.find( ingestKey => ingestKey.id === selectedId );

    const collection = useCollection( ingestKeys, {
        fields: INGEST_KEY_CONFIG.columns,
        alphaKey: 'label',
        sortValues: SORT_VALUES,
    } );

    const handleConfirm = async () =>
    {
        const action = confirming;
        setConfirming( undefined );
        if( !selected ) return;

        if( action === 'revoke' ) await revoke.mutateAsync( selected.id ).catch( () => undefined );

        if( action === 'delete' )
        {
            await deleteKey.mutateAsync( selected.id ).catch( () => undefined );
            setSelectedId( undefined );
        }
    };

    const pageError = error ?? revoke.error ?? deleteKey.error;

    return (
        <Page title={t( 'pages.ingestKeys.title' )} description={t( 'pages.ingestKeys.description' )}>
            <NavbarLayout
                title={t( 'pages.ingestKeys.title' )}
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
                                    iconKey="key"
                                    title={selected.label}
                                    onEdit={selected.revokedAt ? undefined : () => setDialog( { ingestKey: selected } )}
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
                                            setConfirming( 'delete' );
                                        }}
                                        sx={{ color: 'danger.main' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconRenderer iconKey="trash" size={16} />
                                            {t( 'shared.buttons.delete' )}
                                        </Box>
                                    </MenuItem>
                                </Menu>

                                <Box
                                    sx={{
                                        flex: 1, minHeight: 0, overflowY: 'auto', p: 3,
                                        display: 'flex', flexDirection: 'column', gap: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip size="small" label={t( `forms.ingestKey.options.${selected.keyType}` )} />
                                        {selected.revokedAt && (
                                            <Chip size="small" color="error" label={t( 'pages.ingestKeys.revoked' )} />
                                        )}
                                    </Box>

                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selected.keyPrefix}…</Typography>

                                    {selected.keyType === 'public' && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {( selected.permittedMeasurementNames ?? [] ).map( name => (
                                                <Chip key={name} size="small" variant="outlined" label={name} />
                                            ) )}
                                        </Box>
                                    )}

                                    {!selected.revokedAt && (
                                        <Box>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                disabled={revoke.isPending}
                                                onClick={() => setConfirming( 'revoke' )}
                                            >
                                                {t( 'pages.ingestKeys.revokeButton' )}
                                            </Button>
                                        </Box>
                                    )}
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
                        searchPlaceholder={t( 'pages.ingestKeys.searchPlaceholder' )}
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
                                    label={t( 'pages.ingestKeys.addButton' )}
                                    onClick={() => setDialog( { ingestKey: null } )}
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

                <CollectionView<IngestKey>
                    mode={viewMode}
                    rows={collection.visibleRows}
                    columns={INGEST_KEY_CONFIG.columns}
                    getRowId={ingestKey => ingestKey.id}
                    selectedRowId={selectedId}
                    onRowClick={toggleSelected}
                    sortKey={collection.sortKey}
                    sortDir={collection.sortDir}
                    onSortChange={collection.toggleSort}
                    isLoading={isLoading}
                    isEmpty={!error && ingestKeys.length === 0}
                    emptyState={
                        <EmptyState
                            icon="key"
                            headline={t( 'pages.ingestKeys.emptyState.headline' )}
                            subtext={t( 'pages.ingestKeys.emptyState.subtext' )}
                            actions={[{
                                label: t( 'pages.ingestKeys.addButton' ),
                                variant: 'contained',
                                onClick: () => setDialog( { ingestKey: null } ),
                            }]}
                        />
                    }
                    getRowChangeNonce={ingestKey => changes[ingestKey.id] ?? 0}
                />

                <IngestKeyDialog
                    open={dialog != null}
                    ingestKey={dialog?.ingestKey ?? null}
                    onClose={() => setDialog( null )}
                />

                <MessageDialog
                    open={confirming != null}
                    onClose={() => setConfirming( undefined )}
                    title={t( confirming === 'revoke' ? 'pages.ingestKeys.revokeButton' : 'pages.ingestKeys.deleteConfirm.title' )}
                    actions={
                        <>
                            <Button onClick={() => setConfirming( undefined )} variant="text">
                                {t( 'shared.buttons.cancel' )}
                            </Button>
                            <Button onClick={handleConfirm} variant="contained" color="error">
                                {t( confirming === 'revoke' ? 'pages.ingestKeys.revokeButton' : 'shared.buttons.delete' )}
                            </Button>
                        </>
                    }
                >
                    <Typography>
                        {confirming === 'revoke'
                            ? t( 'pages.ingestKeys.revokeConfirm' )
                            : t( 'pages.ingestKeys.deleteConfirm.body', { name: selected?.label ?? '' } )}
                    </Typography>
                </MessageDialog>
            </NavbarLayout>
        </Page>
    );
}

export default PageIngestKeys;
