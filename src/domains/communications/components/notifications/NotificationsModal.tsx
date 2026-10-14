import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, List, Box, Typography, Button, Stack, Chip } from '@/components/ui';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types/notification.types';
import { NotificationItem } from './NotificationItem';

export interface NotificationsModalProps
{
    open: boolean;
    onClose: () => void;
    onNotificationClick?: ( notification: Notification ) => void;
}

export function NotificationsModal( { open, onClose, onNotificationClick }: NotificationsModalProps )
{
    const { t } = useTranslation();
    const { notifications, newCount, dismiss, clearAll, clearNewCount, markAllAsSeen } = useNotifications();

    useEffect( () =>
    {
        if( open ) clearNewCount();
        else markAllAsSeen();
    }, [open] );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                paddingBottom={2}
            >
                <Typography variant="h6">
                    {t( 'navbar.profile.menu.notifications', 'Notifications' )}
                </Typography>

                {newCount > 0 && (
                    <Chip
                        label={`${newCount} new`}
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                    />
                )}
            </Stack>

            {notifications.length === 0 ? (
                <Box sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {t( 'notifications.placeholder', 'No notifications yet' )}
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={2}>
                    <List disablePadding>
                        {notifications.map( ( notification ) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={() => onNotificationClick?.( notification )}
                                onDismiss={dismiss}
                            />
                        ) )}
                    </List>
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" variant="outlined" color="secondary" onClick={clearAll}>
                                {t( 'notifications.clearAll', 'Clear all' )}
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            )}
        </Dialog>
    );
}
