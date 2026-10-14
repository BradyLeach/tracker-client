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
export const authItems: MenuItemConfig[] = [
    {
        id: 'profile',
        iconKey: 'user',
        label: 'navbar.profile.menu.profile',
        actionType: ConfigMenuActionTypes.NAVIGATE_TO,
        actionValue: '/profile',
    },
    {
        id: 'accountSettings',
        iconKey: 'settings',
        label: 'navbar.profile.menu.accountSettings',
        actionType: ConfigMenuActionTypes.NAVIGATE_TO,
        actionValue: '/account/settings',
    },
    {
        id: 'theme',
        iconKey: 'palette',
        label: 'navbar.profile.menu.themeSettings',
        actionType: ConfigMenuActionTypes.OPEN_MODAL,
        showDividerBefore: true,
    },
    {
        id: 'language',
        iconKey: 'world',
        label: 'navbar.profile.menu.language',
        actionType: ConfigMenuActionTypes.OPEN_MODAL,
    },
    {
        id: 'currency',
        iconKey: 'currency',
        label: 'navbar.profile.menu.currency',
        actionType: ConfigMenuActionTypes.OPEN_MODAL,
    },
    {
        id: 'country',
        iconKey: 'world',
        label: 'navbar.profile.menu.country',
        actionType: ConfigMenuActionTypes.OPEN_MODAL,
    },
    {
        id: 'logout',
        iconKey: 'logout',
        label: 'navbar.profile.menu.logout',
        actionType: ConfigMenuActionTypes.LOGOUT,
    },
];