/**
 * NavRail Playground
 *
 * The rail composition — logo, account menu, navigation, theme toggle — inside
 * the SidePanel it ships in. Each piece has its own playground; this proves
 * they arrange correctly together and that the toggle stays pinned to the foot
 * at both sizes.
 *
 * The theme toggle here is the real control. Clicking it changes the app.
 */

import { useState } from 'react';
import { Box, Typography, Stack, Button } from '@/components/ui';
import { Page } from '@/components/container/Page';
import { SidePanel, type PanelSize } from '@/components/container/SidePanel';
import { NavRail } from '@/components/navbar/NavRail';
import type { SidebarNavItemConfig } from '@/components/configMenu';

// ─── Mock config ──────────────────────────────────────────────────────────────
// Stands in for SAASY_SOAP_NAV_CONFIG until the app nav config carries icons.

const items: SidebarNavItemConfig[] = [
    { id: 'home', iconKey: 'layoutGrid', label: 'Home', path: '/home' },
    { id: 'orders', iconKey: 'truck', label: 'Orders', path: '/suppliers/orders' },
    { id: 'inventory', iconKey: 'buildingWarehouse', label: 'Inventory', path: '/inventory' },
    { id: 'partners', iconKey: 'building', label: 'Partners', path: '/partnerships' },
    { id: 'reports', iconKey: 'trendingUp', label: 'Reports', path: '/reports' },
];

export function PageNavRailPlayground()
{
    const [size, setSize] = useState<PanelSize>( 'mini' );
    const [activeId, setActiveId] = useState( 'inventory' );

    return (
        <Page title="NavRail Playground" description="Rail composition inside its panel">
            <Box sx={{ p: 4, maxWidth: 1100 }}>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Button variant={size === 'mini' ? 'contained' : 'outlined'} size="small" onClick={() => setSize( 'mini' )}>mini</Button>
                    <Button variant={size === 'full' ? 'contained' : 'outlined'} size="small" onClick={() => setSize( 'full' )}>full</Button>
                </Stack>

                <Box sx={{ display: 'flex', height: 560, border: 1, borderColor: 'border.base', borderRadius: 1, overflow: 'hidden' }}>
                    <SidePanel side="left" open size={size} surface="rail">
                        <NavRail
                            items={items}
                            variant={size}
                            activeId={activeId}
                            onItemClick={i => setActiveId( i.id )}
                        />
                    </SidePanel>

                    <Box sx={{ flex: 1, minWidth: 0, p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Workspace. The toggle stays at the foot of the rail regardless of height.
                        </Typography>
                    </Box>
                </Box>

            </Box>
        </Page>
    );
}
