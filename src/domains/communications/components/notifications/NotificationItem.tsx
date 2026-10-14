import { useState } from 'react';
import { ListItemButton, ListItemText, Box, Typography, Avatar, IconButton, Tooltip, Swipeable } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import type { Notification } from '../../types/notification.types';

export type { Notification as NotificationItemData };

interface NotificationItemProps
{
    notification: Notification;
    onClick?: () => void;
    onDismiss?: ( id: number ) => void;
}

const isTouchDevice = typeof window !== 'undefined' && window.matchMedia( '(hover: none) and (pointer: coarse)' ).matches;

export function NotificationItem( { notification, onClick, onDismiss }: NotificationItemProps )
{
    const [isHovered, setIsHovered] = useState( false );

    const handleDismiss = ( e: React.MouseEvent ) =>
    {
        e.stopPropagation();
        onDismiss?.( notification.id );
    };

    return (
        <Swipeable
            disabled={!isTouchDevice}
            onSwipeLeft={() => onDismiss?.( notification.id )}
            rightReveal={<IconRenderer iconKey="close" size={20} />}
            rightColor="error.main"
            threshold={60}
        >
            <ListItemButton
                onClick={onClick}
                onMouseEnter={() => setIsHovered( true )}
                onMouseLeave={() => setIsHovered( false )}
                sx={{
                    position: 'relative',
                    pl: 2.5,
                    ...( notification.isNew && {
                        backgroundColor: 'background.default'
                    } ),
                }}
            >
                {notification.avatarUrl && (
                    <Avatar
                        src={notification.avatarUrl}
                        alt={notification.title}
                        sx={{ mr: 2 }}
                    />
                )}

                <ListItemText
                    primary={notification.title}
                    secondary={notification.message || notification.timestamp}
                    slotProps={{
                        primary: {
                            variant: 'subtitle2',
                            fontWeight: notification.isNew ? 600 : 400,
                        },
                        secondary: { noWrap: true },
                    }}
                />

                <Box sx={{ ml: 2, flexShrink: 0, position: 'relative', width: 40 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            whiteSpace: 'nowrap',
                            opacity: isHovered ? 0 : 0.4,
                            transition: 'opacity 0.2s ease',
                        }}
                    >
                        {notification.timestamp}
                    </Typography>

                    {!isTouchDevice && (
                        <Box
                            sx={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                opacity: isHovered ? 0.6 : 0,
                                transition: 'opacity 0.2s ease',
                            }}
                        >
                            <Tooltip title="Dismiss" placement="bottom">
                                <IconButton
                                    size="small"
                                    onClick={handleDismiss}
                                    aria-label={`Dismiss notification from ${notification.title}`}
                                    sx={{ '&:hover': { backgroundColor: 'transparent' } }}
                                >
                                    <IconRenderer iconKey="close" size={18} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
            </ListItemButton>
        </Swipeable>
    );
}
