/**
 * Menu - Config-driven menu system
 *
 * Exports:
 * - ConfigMenu: Main menu component
 * - ConfigMenuItem: Individual menu item component
 * - dispatchMenuAction: Action dispatcher
 * - Types: Shared interface/types
 */

export { ConfigMenu } from './ConfigMenu';
export { ConfigMenuItem } from './ConfigMenuItem';
export { dispatchMenuAction } from './configMenu.utils';

export type {
    BaseMenuItemConfig,
    ConfigMenuProps,
    ConfigMenuItemProps,
    MenuItemConfig,
    SidebarNavItemConfig,
    ConfigMenuActionType,
    ConfigMenuActionHandlers,
} from './configMenu.types';

export { ConfigMenuActionTypes } from './configMenu.types';
