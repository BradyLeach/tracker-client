/**
 * PageBullseye
 *
 * The Bullseye board: ideas for every traction channel, worked from the outer ring —
 * what might work — through a cheap test in the middle ring to focus in the inner. The
 * channel library beside it lists all nineteen channels, so none is skipped.
 *
 * Composition only. The arrangement is the orchestrator's; each ring and the library are
 * components taking data as props.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { Box, Button, ResponsiveButton, Skeleton, Tab, Tabs, Typography } from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { formatApiError } from '@/core/utils';
import { typeCatalogue } from '@/domains/system';
import { useChannelIdeas } from '../channelIdea/hooks/useChannelIdeas';
import { useDeleteChannelIdea } from '../channelIdea/hooks/useDeleteChannelIdea';
import { channelIdeaService } from '../channelIdea/services/channelIdea.service';
import { RING_ORDER, countIdeasByChannel, groupIdeasByRing } from '../channelIdea/orchestrators/bullseye.orchestrator';
import { BullseyeRingColumn } from '../channelIdea/components/BullseyeRingColumn';
import { ChannelLibrary } from '../channelIdea/components/ChannelLibrary';
import { ChannelIdeaDialog } from '../channelIdea/components/ChannelIdeaDialog';
import type { ApiError } from '@/services/dataService/dataService.types';
import type { BullseyeRing, ChannelIdea } from '../channelIdea/types/channelIdea.types';

/** Three rings side by side on wide screens, stacked below. */
const RING_COLUMNS = { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' };

type BullseyeTab = 'board' | 'channels';

export function PageBullseye()
{
    const { t } = useTranslation();

    const { data: ideas = [], isLoading, error } = useChannelIdeas();
    const deleteIdea = useDeleteChannelIdea();

    const [tab, setTab] = useState<BullseyeTab>( 'board' );
    const [dialogIdea, setDialogIdea] = useState<Partial<ChannelIdea> | null>( null );
    const [deletingIdea, setDeletingIdea] = useState<ChannelIdea | null>( null );
    const [movingId, setMovingId] = useState<string>();
    const [moveError, setMoveError] = useState<ApiError>();

    const byRing = useMemo( () => groupIdeasByRing( ideas ), [ideas] );
    const ideaCounts = useMemo( () => countIdeasByChannel( ideas ), [ideas] );

    /**
     * A move is an update to one idea's ring. The update hook binds one id, and a move can
     * come from any card, so it goes through the service; the store re-emits on its own.
     */
    const moveIdea = async ( idea: ChannelIdea, ring: BullseyeRing ) =>
    {
        setMovingId( idea.id );
        setMoveError( undefined );
        const response = await channelIdeaService.update( idea.id, { ring } );
        if( response.error ) setMoveError( response.error );
        setMovingId( undefined );
    };

    const handleDelete = async () =>
    {
        const idea = deletingIdea;
        setDeletingIdea( null );
        if( idea ) await deleteIdea.mutateAsync( idea.id ).catch( () => undefined );
    };

    const pageError = error ?? moveError ?? deleteIdea.error;

    return (
        <Page title={t( 'pages.bullseye.title' )} description={t( 'pages.bullseye.description' )}>
            <NavbarLayout title={t( 'pages.bullseye.title' )}>
                <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}
                >
                    <Tabs value={tab} onChange={( _event, next: BullseyeTab ) => setTab( next )}>
                        <Tab value="board" label={t( 'pages.bullseye.title' )} />
                        <Tab value="channels" label={t( 'pages.bullseye.channelsTitle' )} />
                    </Tabs>
                    <ResponsiveButton
                        variant="outlined"
                        color="primary"
                        size="small"
                        iconKey="plus"
                        label={t( 'pages.bullseye.addButton' )}
                        onClick={() => setDialogIdea( { ring: 'outer' } )}
                    />
                </Box>

                {pageError && (
                    <Typography role="alert" color="error" sx={{ mb: 2 }}>
                        {formatApiError( t, pageError )}
                    </Typography>
                )}

                {tab === 'board' && (
                    isLoading
                        ? <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 1 }} />
                        : (
                            <Box sx={{ display: 'grid', gridTemplateColumns: RING_COLUMNS, gap: 3, alignItems: 'start' }}>
                                {RING_ORDER.map( ring => (
                                    <BullseyeRingColumn
                                        key={ring}
                                        ring={ring}
                                        ideas={byRing[ring]}
                                        catalogue={typeCatalogue}
                                        movingId={movingId}
                                        onMove={moveIdea}
                                        onEdit={setDialogIdea}
                                        onDelete={setDeletingIdea}
                                    />
                                ) )}
                            </Box>
                        )
                )}

                {tab === 'channels' && (
                    <ChannelLibrary
                        catalogue={typeCatalogue}
                        ideaCounts={ideaCounts}
                        onAddIdea={channelId => setDialogIdea( { channelId, ring: 'outer' } )}
                    />
                )}

                <ChannelIdeaDialog open={dialogIdea != null} idea={dialogIdea} onClose={() => setDialogIdea( null )} />

                <MessageDialog
                    open={deletingIdea != null}
                    onClose={() => setDeletingIdea( null )}
                    title={t( 'pages.bullseye.deleteConfirm.title' )}
                    actions={
                        <>
                            <Button onClick={() => setDeletingIdea( null )} variant="text">
                                {t( 'shared.buttons.cancel' )}
                            </Button>
                            <Button onClick={handleDelete} variant="contained" color="error">
                                {t( 'shared.buttons.delete' )}
                            </Button>
                        </>
                    }
                >
                    <Typography>{t( 'pages.bullseye.deleteConfirm.body', { title: deletingIdea?.title ?? '' } )}</Typography>
                </MessageDialog>
            </NavbarLayout>
        </Page>
    );
}

export default PageBullseye;
