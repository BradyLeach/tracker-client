/**
 * Tracker Application Navigation Configuration
 *
 * Declarative navigation structure for the Tracker app — the single source
 * of truth for the navigation rail and its small-screen equivalent. Adding or
 * removing an entry here is the only change needed to alter navigation.
 *
 * All labels are i18n keys, translated at render time.
 *
 * Uses SidebarNavItemConfig, the same shape the account sidebar is driven by.
 * The rail is icon-first, so `iconKey` is required — and since this will be
 * served by the /me endpoint, an icon has to be a string key rather than a
 * component, which is what `iconKey` and IconRenderer already provide.
 *
 * Destinations without a page yet point at /home until they have one.
 */

import type { SidebarNavItemConfig } from '@/components/configMenu';

export const TRACKER_NAV_ITEMS: SidebarNavItemConfig[] = [
    {
        id: 'home',
        iconKey: 'layoutGrid',
        label: 'navbar.drawer.home',
        path: '/home',
    },
    {
        id: 'partnerships',
        iconKey: 'building',
        label: 'navbar.drawer.partnerships',
        path: '/partnerships',
    },
    {
        id: 'team',
        iconKey: 'users',
        label: 'navbar.drawer.team',
        path: '/home',
    },
];
