/**
 * NotificationsButton
 *
 * Header trigger for the notifications panel. Shows the unread count as a
 * badge and nothing else — the panel owns the list.
 *
 * Caller-controlled: it takes a count and a click handler and holds no state
 * of its own, so the header decides where the count comes from and what
 * opening means.
 */

import { useTranslation } from 'react-i18next';
import { IconButton, Badge } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';

export interface NotificationsButtonProps
{
    /** Unread count. Zero hides the badge. */
    count?: number;
    onClick: () => void;
}

export function NotificationsButton( { count = 0, onClick }: NotificationsButtonProps )
{
    const { t } = useTranslation();
    const label = t( 'navbar.profile.menu.notifications', 'Notifications' );

    return (
        <IconButton onClick={onClick} aria-label={label}>
            <Badge
                badgeContent={count > 0 ? count : 0}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}
            >
                <IconRenderer iconKey="bell" size={20} />
            </Badge>
        </IconButton>
    );
}

export default NotificationsButton;
