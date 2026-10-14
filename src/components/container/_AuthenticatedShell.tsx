/**
 * AuthenticatedShell
 *
 * The frame every authenticated page renders inside: header row across the
 * top, navigation rail down the left, content in the remaining space.
 *
 * Composed from primitives that each have their own playground — AppHeader,
 * SidePanel and NavRail. This file only arranges them and owns the rail's
 * open/size state, since that is the one thing neither of them can know.
 *
 * Responsive behaviour is a change of SidePanel mode, not a different
 * component: the rail is permanent from md up, and a dismissible overlay
 * below that, opened from the header.
 *
 * The rail is mini at every width. SidePanel and NavRail both still support
 * the wider size; this shell never asks for it, and omitting NavRail's
 * `onToggleVariant` is what removes the control.
 */

import { useState, type ReactNode } from 'react';
import { Box, IconButton } from '@/components/ui';
import { IconRenderer } from '@/components/ui/icons/Icon';
import { AppHeader } from '@/components/navbar/AppHeader';
import { NavRail } from '@/components/navbar/NavRail';
import { SidePanel } from '@/components/container/SidePanel';
import { useMenu } from '@/core/context';
import { useIsDesktop } from '@/hooks/useIsDesktop';

interface AuthenticatedShellProps
{
    children: ReactNode;
    banner?: ReactNode;
    /** Page title shown in the header. */
    title?: string;
}

export function AuthenticatedShell( { children, banner, title }: AuthenticatedShellProps )
{
    const { config: navItems } = useMenu();
    const isDesktop = useIsDesktop();
    const [mobileNavOpen, setMobileNavOpen] = useState( false );

    return (
        // Row of rail + everything else, bounded to the viewport. The rail is a
        // top-level flex child so it is full screen height by construction —
        // it needs no height of its own and cannot be stretched by page content.
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

            <SidePanel
                side="left"
                open={isDesktop || mobileNavOpen}
                size="mini"
                surface="rail"
                mode={isDesktop ? 'permanent' : 'temporary'}
                onClose={() => setMobileNavOpen( false )}
            >
                <NavRail
                    items={navItems}
                    variant="mini"
                    onItemClick={() => setMobileNavOpen( false )}
                />
            </SidePanel>

            {/* Header sits inside the content column, beside the rail, as in the
                design. minWidth:0 because a flex item otherwise grows to fit its
                content and widens the whole row. */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {banner && <Box>{banner}</Box>}

                <AppHeader
                    title={title}
                    onSearchClick={() => { /* TODO: open SearchModal */ }}
                    leading={!isDesktop && (
                        <IconButton
                            onClick={() => setMobileNavOpen( true )}
                            aria-label="Open navigation"
                            sx={{ mr: 1 }}
                        >
                            <IconRenderer iconKey="layoutGrid" size={20} />
                        </IconButton>
                    )}
                />

                {/* Bounded, non-scrolling: it fixes the height the page's own
                    regions resolve against so each can scroll independently. */}
                <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {children}
                </Box>
            </Box>

        </Box>
    );
}
