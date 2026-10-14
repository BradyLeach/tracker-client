/**
 * ConfigMenu Playground - Interactive Testing Environment
 *
 * Interactive testbed demonstrating ConfigMenu system with config-driven menu items.
 * Allows developers to test menu rendering, action dispatching, badges, dividers,
 * and disabled states with live controls.
 *
 * Key Demonstrations:
 * - ConfigMenu component with config-driven items
 * - Action dispatcher with typed handlers (modal, navigate, logout)
 * - IconRenderer integration with IconKey types
 * - Badge counts on menu items
 * - Divider placement with showDividerBefore
 * - Disabled menu items
 * - Menu positioning and styling
 *
 * Responsive Behavior:
 * - Mobile (< 900px): Controls stacked above menu demo, full width
 * - Desktop (≥ 900px): Controls sidebar on left, demo on right
 * - Large screens: Centered with max 1200px container
 *
 * Menu Features Tested:
 * - Multiple action types (openModal, navigateTo, logout)
 * - Icons from iconMap (IconKey type-safe)
 * - Badge counts (dynamic notification counter)
 * - Dividers between sections
 * - Disabled state handling
 * - Click handling and menu close behavior
 *
 * Usage for New Developers:
 * 1. Click "Open Menu" button to trigger menu
 * 2. Use controls to toggle badge count and disabled states
 * 3. Click menu items to see action dispatching
 * 4. Check "Last Action" panel to see dispatched action details
 * 5. Observe menu behavior (close on click, dividers, etc.)
 */
import { useState } from 'react';
import { Box, Button, Typography, Stack, Card } from '@/components/ui';
import { Page } from '@/components/container/Page';
import { ConfigMenu, dispatchMenuAction } from '@/components/configMenu';
import type { MenuItemConfig, ConfigMenuActionHandlers } from '@/components/configMenu';

export function PageConfigMenuPlayground()
{
    /**
     * Menu state management
     *
     * Controls menu anchor and UI state for demonstration:
     * - anchorEl: HTML element for menu positioning
     * - notificationCount: Badge count for notifications item
     * - settingsDisabled: Toggle disabled state for settings item
     * - lastAction: Captures last menu action for display
     */
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>( null );
    const [notificationCount, setNotificationCount] = useState( 3 );
    const [settingsDisabled, setSettingsDisabled] = useState( false );
    const [lastAction, setLastAction] = useState<any>( null );

    const open = Boolean( anchorEl );

    /**
     * Menu item configuration
     *
     * Demonstrates config-driven menu pattern:
     * - Each item has id, iconKey, label, actionType, actionValue
     * - iconKey must match IconKey type from iconMap
     * - actionType determines dispatch behavior (openModal, navigateTo, logout)
     * - actionValue provides context (modal ID, route path, etc.)
     * - showDividerBefore adds visual separator
     * - badgeCount shows notification badge
     * - disabled prevents interaction
     *
     * This config is what parent components (ProfileMenu, etc.) would define
     * and pass to ConfigMenu for rendering.
     */
    const menuItems: MenuItemConfig[] = [
        {
            id: 'profile',
            iconKey: 'user',
            label: 'Profile',
            actionType: 'openModal',
            actionValue: 'profile',
        },
        {
            id: 'notifications',
            iconKey: 'bell',
            label: 'Notifications',
            actionType: 'openModal',
            actionValue: 'notifications',
            badgeCount: notificationCount,
        },
        {
            id: 'settings',
            iconKey: 'settings',
            label: 'Settings',
            actionType: 'openModal',
            actionValue: 'settings',
            disabled: settingsDisabled,
            showDividerBefore: true,
        },
        {
            id: 'preferences',
            iconKey: 'palette',
            label: 'Preferences',
            actionType: 'navigateTo',
            actionValue: '/preferences',
        },
        {
            id: 'logout',
            iconKey: 'logout',
            label: 'Logout',
            actionType: 'logout',
            showDividerBefore: true,
        },
    ];

    /**
     * Menu action handlers
     *
     * Production pattern: Define typed handlers for each action type.
     * dispatchMenuAction() routes menu item clicks to appropriate handler
     * based on actionType.
     *
     * In production:
     * - onOpenModal: Would open actual modals (theme, profile, etc.)
     * - onNavigate: Would use react-router navigate()
     * - onLogout: Would call auth service logout
     *
     * Here we capture actions for display in playground.
     */
    const actionHandlers: ConfigMenuActionHandlers = {
        onOpenModal: ( modalId ) =>
        {
            setLastAction( { type: 'openModal', modalId, timestamp: new Date().toISOString() } );
        },
        onNavigate: ( path ) =>
        {
            setLastAction( { type: 'navigate', path, timestamp: new Date().toISOString() } );
        },
        onLogout: () =>
        {
            setLastAction( { type: 'logout', timestamp: new Date().toISOString() } );
        },
    };

    /**
     * Menu handlers
     */
    const handleOpenMenu = ( event: React.MouseEvent<HTMLElement> ) =>
    {
        setAnchorEl( event.currentTarget );
    };

    const handleCloseMenu = () =>
    {
        setAnchorEl( null );
    };

    const handleMenuAction = ( item: MenuItemConfig ) =>
    {
        dispatchMenuAction( item, actionHandlers );
    };

    return (
        <Page title="ConfigMenu Playground" description="Test ConfigMenu component with config-driven items">

            <Card sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    ConfigMenu Playground
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom mb={3}>
                    Test ConfigMenu with config-driven items, action dispatching, badges, and disabled states.
                </Typography>
            </Card>

            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>

                    {
                        /**
                         * Controls Panel
                         *
                         * Interactive controls to toggle playground states:
                         * - Badge Count: Increment/decrement notification badge
                         * - Settings Disabled: Toggle disabled state for settings item
                         * - Clear Action: Reset last action display
                         * - Last Action: Shows JSON of most recent menu action
                         *
                         * Demonstrates:
                         * - How badge counts update dynamically
                         * - Disabled state behavior
                         * - Action dispatching visibility
                         *
                         * Responsive:
                         * - Mobile: Full width, appears above demo
                         * - Desktop: Fixed width sidebar, appears left of demo
                         */
                    }
                    <Card>
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Controls
                            </Typography>

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Notification Badge
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setNotificationCount( Math.max( 0, notificationCount - 1 ) )}
                                        >
                                            -
                                        </Button>
                                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                                            {notificationCount}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setNotificationCount( notificationCount + 1 )}
                                        >
                                            +
                                        </Button>
                                    </Stack>
                                </Box>

                                <Button
                                    variant={settingsDisabled ? 'contained' : 'outlined'}
                                    onClick={() => setSettingsDisabled( !settingsDisabled )}
                                    fullWidth
                                >
                                    {settingsDisabled ? 'Enable' : 'Disable'} Settings
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() => setLastAction( null )}
                                    fullWidth
                                    disabled={!lastAction}
                                >
                                    Clear Action
                                </Button>

                                <Box sx={{ pt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Menu State
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Open: {open ? 'Yes' : 'No'}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Items: {menuItems.length}
                                    </Typography>
                                </Box>

                                {lastAction && (
                                    <Box sx={{ pt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Last Action:
                                        </Typography>
                                        <Box
                                            component="pre"
                                            sx={{
                                                fontSize: 10,
                                                bgcolor: 'grey.100',
                                                p: 1,
                                                borderRadius: 1,
                                                overflow: 'auto',
                                                maxHeight: 200,
                                            }}
                                        >
                                            {JSON.stringify( lastAction, null, 2 )}
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Card>

                    {
                        /**
                         * ConfigMenu Demonstration
                         *
                         * Shows ConfigMenu component in action:
                         *
                         * Features Demonstrated:
                         * 1. Config-driven menu items (no hardcoded MenuItem components)
                         * 2. Icon rendering via IconRenderer (type-safe IconKey)
                         * 3. Badge counts on notification item
                         * 4. Dividers before settings and logout sections
                         * 5. Disabled state (settings can be disabled via control)
                         * 6. Action dispatching (click logs to Last Action panel)
                         *
                         * Key Patterns:
                         * - Parent component defines menuItems config
                         * - Parent provides actionHandlers for dispatch
                         * - ConfigMenu handles all rendering and click logic
                         * - Menu auto-closes after item click
                         * - Actions are type-safe via ConfigMenuActionType
                         *
                         * Responsive:
                         * - Mobile: Full width card
                         * - Desktop: Flex layout
                         */
                    }
                    <Card>
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Menu Demo
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Click button to open menu. Menu items dispatch actions shown in controls panel.
                            </Typography>

                            <Box sx={{ mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleOpenMenu}
                                    aria-controls={open ? 'config-menu-demo' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                >
                                    Open Menu
                                </Button>

                                <ConfigMenu
                                    items={menuItems}
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleCloseMenu}
                                    onAction={handleMenuAction}
                                />
                            </Box>

                            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Menu Config Preview
                                </Typography>
                                <Box
                                    component="pre"
                                    sx={{
                                        fontSize: 10,
                                        bgcolor: 'grey.100',
                                        p: 2,
                                        borderRadius: 1,
                                        overflow: 'auto',
                                        maxHeight: 300,
                                    }}
                                >
                                    {JSON.stringify( menuItems, null, 2 )}
                                </Box>
                            </Box>
                        </Box>
                    </Card>
                </Stack>
            </Box>
        </Page>
    );
}
