/**
 * SidePanel Playground
 *
 * The panel primitive on its own. Contents are deliberately plain boxes —
 * SidePanel knows nothing about what it carries, and demonstrating it with a
 * nav menu inside would hide that.
 *
 * The nav menu has its own playground.
 */

import { useState } from 'react';
import { Box, Typography, Stack, Button, Divider } from '@/components/ui';
import { Page } from '@/components/container/Page';
import { SidePanel, type PanelSize } from '@/components/container/SidePanel';

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

function Filler( { label }: { label: string } )
{
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
    );
}

// ─── Playground ───────────────────────────────────────────────────────────────

export function PageNavbarSidebarLayoutPlayground()
{
    const [size, setSize] = useState<PanelSize>( 'mini' );
    const [leftOpen, setLeftOpen] = useState( true );
    const [rightOpen, setRightOpen] = useState( false );
    const [tempOpen, setTempOpen] = useState( false );

    return (
        <Page title="SidePanel Playground" description="Edge-anchored panel primitive">
            <Box sx={{ p: 4, maxWidth: 1100 }}>

                <Section
                    title="Push — both edges"
                    note="Panels occupy layout space. The content between them narrows; nothing floats over it."
                >
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Button variant={size === 'mini' ? 'contained' : 'outlined'} size="small" onClick={() => setSize( 'mini' )}>mini</Button>
                        <Button variant={size === 'full' ? 'contained' : 'outlined'} size="small" onClick={() => setSize( 'full' )}>full</Button>
                        <Divider orientation="vertical" flexItem />
                        <Button variant={leftOpen ? 'contained' : 'outlined'} size="small" onClick={() => setLeftOpen( !leftOpen )}>left</Button>
                        <Button variant={rightOpen ? 'contained' : 'outlined'} size="small" onClick={() => setRightOpen( !rightOpen )}>right</Button>
                    </Stack>

                    <Box sx={{ display: 'flex', height: 320, border: 1, borderColor: 'border.base', borderRadius: 1, overflow: 'hidden' }}>
                        <SidePanel side="left" open={leftOpen} size={size} surface="rail">
                            <Filler label="left" />
                        </SidePanel>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Filler label="content" />
                        </Box>

                        <SidePanel side="right" open={rightOpen} size="full" fullWidth={260}>
                            <Filler label="right" />
                        </SidePanel>
                    </Box>
                </Section>

                <Section
                    title="Surface"
                    note="'rail' is the near-black navigation ground, constant across light and dark. 'paper' sits with the page."
                >
                    <Box sx={{ display: 'flex', height: 140, border: 1, borderColor: 'border.base', borderRadius: 1, overflow: 'hidden' }}>
                        <SidePanel side="left" open size="mini" surface="rail">
                            <Filler label="rail" />
                        </SidePanel>
                        <SidePanel side="left" open size="mini" surface="paper">
                            <Filler label="paper" />
                        </SidePanel>
                        <Box sx={{ flex: 1 }} />
                    </Box>
                </Section>

                <Section
                    title="Temporary — overlay"
                    note="Below the breakpoint the same panel becomes a dismissible overlay, with scrim and focus handling from the underlying Drawer."
                >
                    <Button variant="outlined" size="small" onClick={() => setTempOpen( true )}>open temporary</Button>
                    <SidePanel
                        side="left"
                        open={tempOpen}
                        mode="temporary"
                        size="full"
                        surface="rail"
                        onClose={() => setTempOpen( false )}
                    >
                        <Filler label="temporary panel — click the scrim to dismiss" />
                    </SidePanel>
                </Section>

            </Box>
        </Page>
    );
}
