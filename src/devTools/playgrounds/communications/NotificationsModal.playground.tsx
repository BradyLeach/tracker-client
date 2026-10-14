import { useState } from 'react';
import { Box, Button, Typography, Stack, Paper, Chip, Divider, IconButton } from '@/components/ui';
import { NotificationsModal } from '@/domains/communications/components/notifications';
import { notificationService } from '@/domains/communications/services/notification.service';
import { _devSeenIds } from '@/domains/communications/hooks/useNotifications';
import { getStateChipSx } from '@/config/stateCategory.config';
import type { Notification } from '@/domains/communications/types/notification.types';
import { IconRenderer } from '@/components/ui/icons/Icon';

interface NotificationConfig extends Notification
{
    seen: boolean;
}

const INITIAL_CONFIG: NotificationConfig[] = [
    { id: 1, title: 'James Johnson', message: 'You: Ta penko ogohesiz figtol jonav.', timestamp: '2 hours ago', avatarUrl: '/assets/user-1-CznVQ9Sv.jpg', seen: false },
    { id: 2, title: 'Sarah Smith', message: "Looks good! I'll review it tomorrow.", timestamp: '5 hours ago', avatarUrl: '/assets/user-2-xyz.jpg', seen: false },
    { id: 3, title: 'Mike Wilson', message: 'Can we schedule a call for next week?', timestamp: '1 day ago', avatarUrl: '/assets/user-3-abc.jpg', seen: true },
];

let nextId = 10;

export function NotificationsModalPlayground()
{
    const [openModal, setOpenModal] = useState( false );
    const [config, setConfig] = useState<NotificationConfig[]>( INITIAL_CONFIG );

    const handleOpenModal = () =>
    {
        // Inject mock synchronously before modal mounts and hook fetches
        notificationService.getSummary = async () => ( {
            data: {
                items: config.map( ( { seen: _seen, ...n } ) => n ),
                newCount: config.filter( n => !n.seen ).length,
            },
        } );

        _devSeenIds.clear();
        config.filter( n => n.seen ).forEach( n => _devSeenIds.add( n.id ) );

        setOpenModal( true );
    };

    const handleCloseModal = () =>
    {
        setOpenModal( false );
    };

    const toggleSeen = ( id: number ) =>
    {
        setConfig( prev => prev.map( n => n.id === id ? { ...n, seen: !n.seen } : n ) );
    };

    const removeNotification = ( id: number ) =>
    {
        setConfig( prev => prev.filter( n => n.id !== id ) );
    };

    const addNotification = () =>
    {
        const id = nextId++;
        setConfig( prev => [...prev, {
            id,
            title: `New Contact ${id}`,
            message: 'This is a new notification.',
            timestamp: 'just now',
            seen: false,
        }] );
    };

    const reset = () =>
    {
        setConfig( INITIAL_CONFIG );
        _devSeenIds.clear();
        nextId = 10;
    };

    const newCount = config.filter( n => !n.seen ).length;

    return (
        <Box sx={{ p: 4, maxWidth: 600 }}>
            <Typography variant="h4" gutterBottom>
                Notifications Playground
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button variant="contained" onClick={handleOpenModal}>
                    Open Modal
                </Button>
                <Button variant="outlined" onClick={addNotification}>
                    + Add notification
                </Button>
                <Button variant="outlined" color="secondary" onClick={reset}>
                    Reset
                </Button>
            </Stack>

            {/* Config panel */}
            <Paper sx={{ mt: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">
                        Notification Config
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {newCount} new · {config.length - newCount} seen
                    </Typography>
                </Box>
                <Divider />
                {config.length === 0 ? (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            No notifications configured
                        </Typography>
                    </Box>
                ) : (
                    <Stack divider={<Divider />}>
                        {config.map( notification => (
                            <Box
                                key={notification.id}
                                sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 2 }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2" noWrap>
                                        {notification.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {notification.message}
                                    </Typography>
                                </Box>

                                <Chip
                                    label={notification.seen ? 'Seen' : 'New'}
                                    size="small"
                                    onClick={() => toggleSeen( notification.id )}
                                    sx={{
                                        cursor: 'pointer',
                                        ...getStateChipSx( notification.seen ? 'muted' : 'active' ),
                                    }}
                                />

                                <IconButton
                                    size="small"
                                    onClick={() => removeNotification( notification.id )}
                                    aria-label={`Remove ${notification.title}`}
                                    sx={{ '&:hover': { color: 'error.main', backgroundColor: 'transparent' } }}
                                >
                                    <IconRenderer iconKey="close" size={16} />
                                </IconButton>
                            </Box>
                        ) )}
                    </Stack>
                )}
            </Paper>

            {/* Conditionally rendered so the hook mounts fresh each open */}
            {openModal && (
                <NotificationsModal
                    open={openModal}
                    onClose={handleCloseModal}
                    onNotificationClick={( n ) => console.log( '[Notifications] click', n.id )}
                />
            )}
        </Box>
    );
}
