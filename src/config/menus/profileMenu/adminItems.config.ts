/**
 * Auth Menu Configuration
 *
 * Declarative configuration for profile/auth menu items.
 * All labels are i18n keys (not translated values).
 * This is the single source of truth for menu structure.
 */
import { type MenuItemConfig, ConfigMenuActionTypes } from '@/components/configMenu/configMenu.types';

/**
 * Profile/Auth menu items configuration
 * Labels are i18n keys that will be translated at render time
 */
export const adminItems: MenuItemConfig[] = [
    {
        id: 'notifications',
        iconKey: 'bell',
        label: 'navbar.profile.menu.notifications',
        actionType: ConfigMenuActionTypes.OPEN_MODAL,
    },
    {
        id: 'profile',
        iconKey: 'user',
        label: 'navbar.profile.menu.profile',
        actionType: ConfigMenuActionTypes.NAVIGATE_TO,
    },
    {
        id: 'theme',
        iconKey: 'palette',
        label: 'navbar.profile.menu.themeSettings',
        actionType: ConfigMenuActionTypes.OPEN_MODAL,
        showDividerBefore: true,
    },
    {
        id: 'switchProfile',
        iconKey: 'switch',
        label: 'navbar.profile.menu.switchProfile',
        actionType: ConfigMenuActionTypes.OPEN_MODAL,
        showDividerBefore: true,
    },
    {
        id: 'logout',
        iconKey: 'logout',
        label: 'navbar.profile.menu.logout',
        actionType: ConfigMenuActionTypes.LOGOUT,
    },
];