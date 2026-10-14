/**
 * DetailPanelHeader Playground
 *
 * The header is domain-agnostic: only `iconKey` changes between companies,
 * inventory and batches. Shown inside a real SidePanel so the truncation and
 * the control positions are the ones a page will actually get.
 *
 * What to check here:
 * - two zones: icon, title and the edit pencil act on the record; expand, the
 *   menu and close act on the panel
 * - every control is icon-only, named by its tooltip and aria-label
 * - a long title truncates without pushing either zone out of place
 *
 * The body is deliberately a placeholder — the detail components slot in below
 * this header.
 */

import { useState } from 'react';
import { Box, Button, IconButton, IconRenderer, Tooltip, Typography } from '@/components/ui';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';
import { SidePanel } from '@/components/container/SidePanel';
import { DetailPanelHeader } from '@/components/container/DetailPanelHeader';
import type { DetailPanelHeaderProps } from '@/components/container/DetailPanelHeader';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
// One entry per domain, to show that only iconKey varies.

const RECORDS: DetailPanelHeaderProps[] = [
    { iconKey: 'building', title: 'Green Living Market' },
    { iconKey: 'package', title: 'Lavender Essential Oil' },
    { iconKey: 'flask', title: 'Batch LAV-217-A' },
    { iconKey: 'truck', title: 'PO-1043' },
    { iconKey: 'building', title: 'Nordic Botanicals & Fine Ingredients International AB' },
    // No iconKey — the Avatar falls back to initials.
    { title: 'Unknown Record Type' },
];

// ─── Playground ───────────────────────────────────────────────────────────────

export function DetailPanelHeaderPlayground()
{
    const [index, setIndex] = useState( 0 );
    const [panelOpen, setPanelOpen] = useState( true );
    const [lastAction, setLastAction] = useState( 'none' );

    const record = RECORDS[index];

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>DetailPanelHeader</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                The fixed top row of every detail panel — record identity, open-as-page and
                close. One component across domains; only <code>iconKey</code> changes.
                The panel body is a separate component and is stubbed here.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {RECORDS.map( ( item, itemIndex ) => (
                    <Button
                        key={item.title}
                        size="small"
                        variant={itemIndex === index ? 'contained' : 'outlined'}
                        onClick={() => { setIndex( itemIndex ); setPanelOpen( true ); }}
                    >
                        {item.iconKey ?? 'no icon'}
                    </Button>
                ) )}
                <Button size="small" variant="outlined" onClick={() => setPanelOpen( open => !open )}>
                    {panelOpen ? 'Close panel' : 'Open panel'}
                </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                last action: {lastAction}
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* Rendered inside the real panel, at the real width. */}
                <Box
                    sx={{
                        display: 'flex',
                        height: 320,
                        border: '1px solid',
                        borderColor: 'border.base',
                        borderRadius: 1,
                        overflow: 'hidden',
                    }}
                >
                    <SidePanel side="right" open={panelOpen} size="full" fullWidth={420}>
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <DetailPanelHeader
                                {...record}
                                onEdit={() => setLastAction( `edit → ${record.title}` )}
                                onExpand={() => setLastAction( `expand → ${record.title}` )}
                                actions={
                                    <Tooltip title="More actions">
                                        <IconButton
                                            size="small"
                                            aria-label="More actions"
                                            onClick={() => setLastAction( `more → ${record.title}` )}
                                        >
                                            <IconRenderer iconKey="dotsVertical" size={16} />
                                        </IconButton>
                                    </Tooltip>
                                }
                                onClose={() => { setLastAction( 'close' ); setPanelOpen( false ); }}
                            />
                            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    &lt;CompanyDetail /&gt; — separate component, built later.
                                </Typography>
                            </Box>
                        </Box>
                    </SidePanel>
                </Box>

                {/* The config driving it. */}
                <Box sx={{ flex: '1 1 320px', minWidth: 280 }}>
                    <PlaygroundDataPreview title="DetailPanelHeaderProps" data={record} />
                </Box>
            </Box>
        </Box>
    );
}

export default DetailPanelHeaderPlayground;
