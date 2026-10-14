/**
 * Realtime Trace Playground
 *
 *  1. Boundaries   — the class on a Card, a TableContainer, a row and a plain Box.
 *  2. Trigger all  — one nonce across several sizes, plus auto-repeat.
 *
 * The effect is CSS (`.realtime-trace` in index.css). `useRealtimeAnimation`
 * only restarts it: any change to `trigger` from one defined value to another
 * runs it once, and it retriggers cleanly mid-run.
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
    Box,
    Stack,
    Typography,
    Card,
    Button,
    Switch,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@/components/ui';
import { useRealtimeAnimation } from '@/components/shared/realtime';
import { PlaygroundDataPreview } from '../../components/PlaygroundDataPreview';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SECTION_LABEL_SX = {
    mb: 1.5,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontSize: 11,
} as const;

/** Stand-in surface. Deliberately plain — the trace is what is under review. */
const PANEL_SX = {
    p: 2,
    border: '1px solid',
    borderColor: 'border.base',
    borderRadius: 1,
    backgroundColor: 'background.sunk',
};

const ROWS = [
    { id: '1', name: 'Coconut oil, refined', quantity: '12.4 kg' },
    { id: '2', name: 'Sodium hydroxide', quantity: '3.1 kg' },
    { id: '3', name: 'Lavender essential oil', quantity: '840 g' },
];

// ─── Per-boundary demo ────────────────────────────────────────────────────────

interface BoundaryDemoProps
{
    label: string;
    caption: string;
    /** Renders the boundary element with the trace class applied to it. */
    children: ( traceClass: string ) => ReactNode;
}

function BoundaryDemo( { label, caption, children }: BoundaryDemoProps )
{
    const [pulse, setPulse] = useState( 0 );
    const traceClass = useRealtimeAnimation( pulse );

    return (
        <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 160 }}>{label}</Typography>
                <Button size="small" variant="outlined" onClick={() => setPulse( current => current + 1 )}>
                    Trigger
                </Button>
                <Typography variant="caption" color="text.secondary">{caption}</Typography>
            </Stack>

            {children( traceClass )}
        </Box>
    );
}

/** One row, so the trace can be shown on a `tr` — the case a wrapper element cannot serve. */
function TracedRow( { name, quantity }: { name: string; quantity: string } )
{
    const [pulse, setPulse] = useState( 0 );
    const traceClass = useRealtimeAnimation( pulse );

    return (
        <TableRow className={traceClass} onClick={() => setPulse( current => current + 1 )} sx={{ cursor: 'pointer' }}>
            <TableCell>{name}</TableCell>
            <TableCell align="right">{quantity}</TableCell>
        </TableRow>
    );
}

// ─── Playground ───────────────────────────────────────────────────────────────

export function RealtimeTracePlayground()
{
    const [allPulse, setAllPulse] = useState( 0 );
    const [autoRepeat, setAutoRepeat] = useState( false );
    const allTraceClass = useRealtimeAnimation( allPulse );

    useEffect( () =>
    {
        if( !autoRepeat ) return;

        const interval = setInterval( () => setAllPulse( current => current + 1 ), 1200 );
        return () => clearInterval( interval );
    }, [autoRepeat] );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Realtime trace</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 620 }}>
                A ring sweeping clockwise around a region a realtime event just changed. The class goes
                on the element that owns the boundary, so nothing wraps it and no layout changes.
                Colour comes from the theme; under <code>prefers-reduced-motion</code> the completed
                ring is held briefly instead of swept.
            </Typography>

            {/* ── Section 1: boundaries ─────────────────────────────────────── */}
            <Typography variant="subtitle2" color="text.secondary" sx={SECTION_LABEL_SX}>
                boundaries — each with its own trigger
            </Typography>

            <BoundaryDemo label="Card" caption="class on the Card itself" >
                {traceClass => (
                    <Card className={traceClass} sx={{ p: 3, width: 280 }}>
                        <Typography variant="subtitle1">Lavender &amp; Oat</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Batch 0412 · 48 bars cured
                        </Typography>
                    </Card>
                )}
            </BoundaryDemo>

            <BoundaryDemo label="Card in a grid cell" caption="fills its track, unlike a wrapper">
                {traceClass => (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
                        <Card className={traceClass} sx={{ p: 3 }}>
                            <Typography variant="body2">Traced cell</Typography>
                        </Card>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="body2" color="text.secondary">Untraced neighbour</Typography>
                        </Card>
                    </Box>
                )}
            </BoundaryDemo>

            <BoundaryDemo label="Whole table" caption="class on the TableContainer">
                {traceClass => (
                    <TableContainer className={traceClass} sx={{ ...PANEL_SX, p: 0, maxWidth: 560 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ingredient</TableCell>
                                    <TableCell align="right">On hand</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ROWS.map( row => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell align="right">{row.quantity}</TableCell>
                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </BoundaryDemo>

            <BoundaryDemo label="Tall panel" caption="200 × 240">
                {traceClass => (
                    <Box className={traceClass} sx={{ ...PANEL_SX, width: 200, height: 240 }}>
                        <Typography variant="caption" color="text.secondary">Detail panel</Typography>
                    </Box>
                )}
            </BoundaryDemo>

            <BoundaryDemo label="Interactive content" caption="clicks still land mid-trace">
                {traceClass => (
                    <Card className={traceClass} sx={{ p: 2, width: 280 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button size="small" variant="contained">Approve</Button>
                            <Button size="small" variant="outlined">Reject</Button>
                        </Stack>
                    </Card>
                )}
            </BoundaryDemo>

            {/* Rows are the case the old wrapper component could never serve: a `tr`
                cannot be wrapped in a div, but it takes a class like anything else. */}
            <Typography variant="subtitle2" color="text.secondary" sx={SECTION_LABEL_SX}>
                single row — click a row to trace it
            </Typography>
            <TableContainer sx={{ ...PANEL_SX, p: 0, maxWidth: 560, mb: 4 }}>
                <Table size="small">
                    <TableBody>
                        {ROWS.map( row => (
                            <TracedRow key={row.id} name={row.name} quantity={row.quantity} />
                        ) )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── Section 2: trigger all ────────────────────────────────────── */}
            <Typography variant="subtitle2" color="text.secondary" sx={SECTION_LABEL_SX}>
                trigger all — one nonce, three sizes
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Button size="small" variant="outlined" onClick={() => setAllPulse( current => current + 1 )}>
                    Trigger all
                </Button>
                <FormControlLabel
                    control={<Switch size="small" checked={autoRepeat} onChange={( _, checked ) => setAutoRepeat( checked )} />}
                    label={<Typography variant="body2">Auto-repeat (1.2s)</Typography>}
                />
            </Stack>

            <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ flexWrap: 'wrap', gap: 3 }}>
                <Card className={allTraceClass} sx={{ p: 2, width: 200 }}>
                    <Typography variant="body2">Small card</Typography>
                </Card>

                <Box className={allTraceClass} sx={{ ...PANEL_SX, width: 120, height: 120 }} />

                <Card className={allTraceClass} sx={{ p: 2, width: 320, height: 160 }}>
                    <Typography variant="body2">Larger card</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Same duration regardless of perimeter.
                    </Typography>
                </Card>
            </Stack>

            <PlaygroundDataPreview
                title="useRealtimeAnimation( trigger )"
                caption="Returns the trace class while a run is active, otherwise an empty string."
                data={{ trigger: allPulse, className: allTraceClass }}
            />
        </Box>
    );
}
