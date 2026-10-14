import type { SidebarNavItemConfig } from '@/components/configMenu';

export const accountSettingsItems: SidebarNavItemConfig[] = [
    { id: 'identity', iconKey: 'user', label: 'pages.userSettings.title', path: '/account/settings' },
    { id: 'account', iconKey: 'building', label: 'pages.accountSettings.title', path: '/account/account' },
    { id: 'notifications', iconKey: 'bell', label: 'pages.userSettings.tabs.notifications', path: '/account/notifications' },
    { id: 'security', iconKey: 'lock', label: 'pages.userSettings.tabs.security', path: '/account/security' },
];
