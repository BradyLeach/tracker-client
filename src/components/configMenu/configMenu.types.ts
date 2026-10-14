import type { IconKey } from '@/config/icons.config';

export const ConfigMenuActionTypes = {
    OPEN_MODAL: 'openModal',
    NAVIGATE_TO: 'navigateTo',
    LOGOUT: 'logout',
} as const;

export type ConfigMenuActionType =
    typeof ConfigMenuActionTypes[keyof typeof ConfigMenuActionTypes];

export type BaseMenuItemConfig = {
    id: string;
    iconKey: IconKey;
    label: string;
    disabled?: boolean;
    showDividerBefore?: boolean;
    badgeCount?: number;
};

export type MenuItemConfig = BaseMenuItemConfig & {
    actionType: ConfigMenuActionType;
    actionValue?: string;
};

export type SidebarNavItemConfig = BaseMenuItemConfig & {
    path: string;
};

export type ConfigMenuProps = {
    items: MenuItemConfig[];
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    onAction?: ( item: MenuItemConfig ) => void;
};

export type ConfigMenuItemProps = {
    item: MenuItemConfig;
    onClick: ( item: MenuItemConfig ) => void;
};

export interface ConfigMenuActionHandlers
{
    onOpenModal?: ( modalId: string ) => void;
    onNavigate?: ( path: string ) => void;
    onLogout?: () => void;
}
