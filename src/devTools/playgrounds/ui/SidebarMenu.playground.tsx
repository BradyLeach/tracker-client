/**
 * SidebarMenu Playground
 *
 * The navigation menu primitive on its own — no panel, no layout. It takes an
 * items array and renders it in whichever direction and presentation the
 * caller asks for. Everything is a prop; nothing is inferred from context,
 * which is why it renders identically here and inside a SidePanel.
 *
 * The panel it usually sits in has its own playground.
 */

import { useState } from 'react';
import { Box, Typography, Stack, Button, Divider } from '@/components/ui';
import { Page } from '@/components/container/Page';
import { SidebarMenu, type SidebarMenuVariant } from '@/components/ui/navigation';
import type { SidebarNavItemConfig } from '@/components/configMenu';

// ─── Mock config ──────────────────────────────────────────────────────────────
// The shape the real navigation is driven by. Add or remove an entry and every
// rendering below follows — that is the whole point of the config.

const items: SidebarNavItemConfig[] = [
    { id: 'profile', iconKey: 'user', label: 'Profile', path: '/account/profile' },
    { id: 'settings', iconKey: 'settings', label: 'Settings', path: '/account/settings', showDividerBefore: true },
    { id: 'notifications', iconKey: 'bell', label: 'Notifications', path: '/account/notifications' },
    { id: 'preferences', iconKey: 'palette', label: 'Preferences', path: '/account/preferences', disabled: true },
];

// ─── Section shell ────────────────────────────────────────────────────────────

function Section( { title, note, children }: { title: string; note?: string; children: React.ReactNode } )
{
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6">{title}</Typography>
            {note && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {note}
                </Typography>
            )}
            {children}
        </Box>
    );
}

// ─── Playground ───────────────────────────────────────────────────────────────

export function PageSidebarMenuPlayground()
{
    const [activeId, setActiveId] = useState( 'settings' );
    const [variant, setVariant] = useState<SidebarMenuVariant>( 'full' );

    return (
        <Page title="SidebarMenu Playground" description="Config-driven navigation menu primitive">
            <Box sx={{ p: 4, maxWidth: 1100 }}>

                <Section title="Controls">
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 64 }}>variant:</Typography>
                        <Button variant={variant === 'full' ? 'contained' : 'outlined'} size="small" onClick={() => setVariant( 'full' )}>full</Button>
                        <Button variant={variant === 'mini' ? 'contained' : 'outlined'} size="small" onClick={() => setVariant( 'mini' )}>mini</Button>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 64 }}>active:</Typography>
                        {items.map( item => (
                            <Button
                                key={item.id}
                                variant={activeId === item.id ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setActiveId( item.id )}
                            >
                                {item.label}
                            </Button>
                        ) )}
                    </Stack>
                </Section>

                <Divider sx={{ mb: 4 }} />

                <Section
                    title="Vertical"
                    note="On the page surface, and on the navigation rail. Active is a neutral stripe plus weight — no accent hue."
                >
                    <Stack direction="row" spacing={3}>
                        <Box sx={{ width: variant === 'mini' ? 76 : 240, border: 1, borderColor: 'border.base', borderRadius: 1, overflow: 'hidden' }}>
                            <SidebarMenu
                                items={items}
                                variant={variant}
                                activeId={activeId}
                                onItemClick={i => setActiveId( i.id )}
                            />
                        </Box>

                        <Box sx={{ width: variant === 'mini' ? 76 : 240, bgcolor: 'sidebar.bg', borderRadius: 1, overflow: 'hidden' }}>
                            <SidebarMenu
                                items={items}
                                variant={variant}
                                surface="rail"
                                activeId={activeId}
                                onItemClick={i => setActiveId( i.id )}
                            />
                        </Box>
                    </Stack>
                </Section>

                <Section
                    title="Horizontal"
                    note="Same items array, same active state. This is what replaces the rail below the breakpoint."
                >
                    <Box sx={{ border: 1, borderColor: 'border.base', borderRadius: 1, px: 1 }}>
                        <SidebarMenu
                            items={items}
                            orientation="horizontal"
                            activeId={activeId}
                            onItemClick={i => setActiveId( i.id )}
                        />
                    </Box>
                </Section>

            </Box>
        </Page>
    );
}
