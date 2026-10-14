/**
 * ProfileMenu - User profile dropdown menu
 *
 * Clean UX for core user preferences and account actions.
 * Modal logic is fully abstracted via useProfileModals().
 * This component is role-agnostic and handles global user preferences.
 *
 * The profile context supplies the avatar; the reactive Identity query supplies the name.
 * Display names are composed here so Identity edits update the initials without rehydration.
 * The avatar shows the profile image when one exists and initials when it does not.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, IconButton } from '@/components/ui';
import { BadgeAvatar } from '@/components/ui/data-display';
import { ConfigMenu, dispatchMenuAction } from '@/components/configMenu';
import type { ConfigMenuActionHandlers } from '@/components/configMenu';
import { authItems, unauthItems } from '@/config/menus/profileMenu';
import { useProfile, getProfileSetters, getMenuSetters } from '@/core/context';
import { authenticationService } from '@/domains/authentication/services/authentication.services';
import { tokenStore } from '@/services/http/tokenStore';
import { getInitials } from '@/core/utils';
import { useCurrentIdentity } from '@/domains/account/identity/hooks/useCurrentIdentity';

/**
 * Props for ProfileMenu
 */
interface ProfileMenuProps
{
    /**
     * Opens a registered profile modal by id.
     *
     * Modal state is owned by AppHeader rather than here, because the header
     * also triggers some of the same modals. One owner, one set rendered.
     */
    onOpenModal: ( modalId: string ) => void;
}

/**
 * Renders the profile menu button and dropdown list.
 * Modal open/close logic is handled by useProfileModals().
 */
export function ProfileMenu( { onOpenModal }: ProfileMenuProps )
{
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>( null );
    const { profile } = useProfile();
    const { data: identity } = useCurrentIdentity();
    const profileName = identity ? `${identity.firstname} ${identity.lastname}` : '';

    const isAuthenticated = Boolean( profile?.id );
    const open = Boolean( anchorEl );
    const handleClick = ( event: React.MouseEvent<HTMLElement> ) => setAnchorEl( event.currentTarget );
    const handleClose = () => setAnchorEl( null );
    const handleLogout = async () =>
    {
        // Backend logout and session teardown complete before the login route renders (fail gracefully)
        await authenticationService.logout().catch( () => {} );

        // Clear access token
        tokenStore.clear();

        // Clear profile context
        const profileSetters = getProfileSetters();
        profileSetters.setProfile?.( undefined );
        profileSetters.setAppPreferenceId?.( undefined );

        // Clear menu context
        const menuSetters = getMenuSetters();
        menuSetters.setConfig?.( [] );

        navigate( '/auth/login' );
    };

    const actionHandlers: ConfigMenuActionHandlers = {
        onOpenModal,
        onNavigate: ( path ) => navigate( path ),
        onLogout: handleLogout,
    };

    const menuItems = isAuthenticated ? authItems : unauthItems;

    const translatedItems = useMemo(
        () => menuItems.map( item => ( {
            ...item,
            label: t( item.label ),
        } ) ),
        [t, menuItems]
    );

    return (
        <Box>
            <IconButton
                size="large"
                aria-label="user profile menu"
                aria-controls={open ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ ...( open && { color: 'text.primary' } ) }}
            >
                <BadgeAvatar
                    avatarProps={{
                        src: profile?.avatarURL,
                        alt: profileName,
                        children: getInitials( profileName ),
                        sx: { backgroundColor: 'graphite' },
                    }}
                />
            </IconButton>

            <ConfigMenu
                items={translatedItems}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onAction={( item ) => dispatchMenuAction( item, actionHandlers )}
            />
        </Box>
    );
}

export default ProfileMenu;
