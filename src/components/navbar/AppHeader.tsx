/**
 * AppHeader
 *
 * The header row: page title, search, notifications, account menu.
 *
 * No brand mark — the rail identifies the app and the design aligns the title
 * with the content's left edge. The Brand slot survives for the rail toggle on
 * small screens.
 *
 * A composition over NavbarScaffold's slots. It carries everything that is
 * not a destination — the navigation rail holds the destinations, and this
 * holds the controls that act on wherever you already are.
 *
 * Search and notifications follow the same shape: an icon that opens a modal.
 * Neither is a place you navigate to, so neither belongs in the rail.
 *
 * Owns the profile modal state because both it and the account menu open
 * modals from the same registry — one owner means one set rendered.
 *
 * @example
 * ```tsx
 * <AppHeader title="Inventory" notificationCount={3} onSearchClick={openSearch} />
 * ```
 */

import { Typography } from '@/components/ui';
import { NavbarScaffold } from '@/components/navbar/NavbarScaffold';
import { SearchButton } from '@/components/navbar/SearchButton';
import { NotificationsButton } from '@/components/navbar/NotificationsButton';
import { ProfileMenu } from '@/components/navbar/ProfileMenu';
import { useProfileModals, ProfileModals } from '@/components/navbar/ProfileModals';

export interface AppHeaderProps
{
    /** Current page title. Omitted on pages that title themselves. */
    title?: string;
    /** Unread notification count. */
    notificationCount?: number;
    /** Opens the search modal. */
    onSearchClick: () => void;
    /** Rendered before the brand — the rail toggle on small screens. */
    leading?: React.ReactNode;
}

export function AppHeader( {
    title,
    notificationCount = 0,
    onSearchClick,
    leading,
}: AppHeaderProps )
{
    const { openStates, onClose, openModal } = useProfileModals();

    const handleOpenModal = ( modalId: string ) =>
    {
        if( modalId in openStates )
        {
            openModal( modalId as keyof typeof openStates );
        }
        else
        {
            console.warn( `[AppHeader] Unknown modal: ${modalId}` );
        }
    };

    return (
        <>
            <NavbarScaffold>
                {leading && (
                    <NavbarScaffold.Brand>
                        {leading}
                    </NavbarScaffold.Brand>
                )}

                {title && (
                    <NavbarScaffold.Title>
                        <Typography variant="h6" sx={{ color: 'text.primary' }}>
                            {title}
                        </Typography>
                    </NavbarScaffold.Title>
                )}

                <NavbarScaffold.Search>
                    <SearchButton onClick={onSearchClick} />
                </NavbarScaffold.Search>

                <NavbarScaffold.Actions>
                    <NotificationsButton
                        count={notificationCount}
                        onClick={() => openModal( 'notifications' )}
                    />
                    <ProfileMenu onOpenModal={handleOpenModal} />
                </NavbarScaffold.Actions>
            </NavbarScaffold>

            <ProfileModals openStates={openStates} onClose={onClose} />
        </>
    );
}

export default AppHeader;
