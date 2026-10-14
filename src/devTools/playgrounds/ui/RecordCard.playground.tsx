/**
 * RecordCard Playground
 *
 * The card every record collection renders. Structure and behaviour live in the
 * card; the domain passes content into its slots.
 *
 * What to check here:
 * - `media` takes any node — an icon Avatar, a profile picture, a logo — so a collection of
 *   people and a collection of formulas use the same card
 * - the content row holds its height when a record has nothing to put in it, so
 *   cards in a grid stay on one baseline
 * - a long title truncates instead of widening the card
 * - selection draws the graphite border and the selected ground
 * - actions reveal on hover above the desktop breakpoint and stay visible below it,
 *   and clicking one does not select the card
 * - the realtime trace runs around the card's own boundary
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    IconRenderer,
    Stack,
    Tooltip,
    Typography,
} from '@/components/ui';
import { RecordCard } from '@/components/shared/records';
import { getInitials } from '@/core/utils';
import { PlaygroundDataPreview } from '@/devTools/components/PlaygroundDataPreview';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

interface Row
{
    id: string;
    title: string;
    subtitle?: string;
    iconKey?: string;
    /** Rendered in the content row. Omitted on one row to prove the fixed height. */
    tags?: string[];
}

const ROWS: Row[] = [
    { id: 'r1', title: 'Lavender Bar', subtitle: 'Cold Process · 1,000 g oil', iconKey: 'flask', tags: ['12 bars', 'NaOH'] },
    { id: 'r2', title: 'Natural Supplies Co.', subtitle: 'natural-supplies.test', iconKey: 'building', tags: ['Supplier'] },
    { id: 'r3', title: 'Oatmeal & Honey', subtitle: 'Hot Process · 940 g oil', iconKey: 'flask', tags: ['6 bars'] },
    // Deliberately no tags — the content row must still hold its height.
    {
        id: 'r4',
        title: 'Unscented Olive and Shea Butter Soap with a Very Long Descriptive Name',
        subtitle: 'Melt and Pour',
        iconKey: 'flask',
    },
    // No icon — the Avatar falls back to initials.
    { id: 'r5', title: 'Craft Solutions IO', tags: ['Stockist'] },
];

const GRID_COLUMNS = 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))';

/** A record's identity as a rounded Avatar — its type icon, or initials when it has none. */
function media( title: string, iconName?: string )
{
    return (
        <Avatar
            variant="rounded"
            sx={{
                width: 48,
                height: 48,
                borderRadius: '6px',
                userSelect: 'none',
                fontSize: 18,
                fontWeight: 600,
                backgroundColor: 'graphite',
                color: 'background.paper',
            }}
        >
            <IconRenderer iconName={iconName} fallback={getInitials( title )} size={25} />
        </Avatar>
    );
}

// ─── Section label ────────────────────────────────────────────────────────────

/** The small caps heading above each scenario. Four of them, so it is one component. */
function SectionLabel( { children }: { children: ReactNode } )
{
    return (
        <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}
        >
            {children}
        </Typography>
    );
}

// ─── Playground ───────────────────────────────────────────────────────────────

export function RecordCardPlayground()
{
    const [selectedId, setSelectedId] = useState<string>();
    const [traceId, setTraceId] = useState<string>();
    const [traceNonce, setTraceNonce] = useState( 0 );
    const [deleted, setDeleted] = useState<string[]>( [] );

    const toggle = ( id: string ) =>
        setSelectedId( previous => previous === id ? undefined : id );

    const trace = () =>
    {
        setTraceId( 'r1' );
        setTraceNonce( previous => previous + 1 );
    };

    const tags = ( row: Row ) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {( row.tags ?? [] ).map( tag => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
            ) )}
        </Box>
    );

    const deleteAction = ( row: Row ) => (
        <Tooltip title="Delete">
            <IconButton
                size="small"
                aria-label="Delete"
                // Acting on a record is not selecting it.
                onClick={event => { event.stopPropagation(); setDeleted( previous => [...previous, row.id] ); }}
                sx={{ width: 28, height: 28 }}
            >
                <IconRenderer iconKey="trash" width={16} stroke={2.5} />
            </IconButton>
        </Tooltip>
    );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>RecordCard</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
                One record as a card, replacing its table row. The card owns the surface, the
                header split, the fixed content height, selection, hover reveal and the realtime
                trace. Everything visible comes from the caller through <code>media</code>,{' '}
                <code>title</code>, <code>subtitle</code>, <code>actions</code> and the children.
            </Typography>

            <Stack direction="row" spacing={1} mb={3} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button size="small" variant="outlined" onClick={() => setSelectedId( undefined )}>
                    Clear selection
                </Button>
                <Button size="small" variant="outlined" onClick={trace}>
                    Trace first card
                </Button>
                <Button size="small" variant="outlined" onClick={() => setDeleted( [] )}>
                    Reset deletes
                </Button>
                <Typography variant="caption" color="text.secondary">
                    selected: {selectedId ?? 'none'} · deleted: {deleted.length ? deleted.join( ', ' ) : 'none'}
                </Typography>
            </Stack>

            <SectionLabel>
                Responsive grid — icon media, delete action
            </SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, gap: 2, alignItems: 'start', mb: 4 }}>
                {ROWS.map( row => (
                    <RecordCard
                        key={row.id}
                        media={media( row.title, row.iconKey )}
                        title={row.title}
                        subtitle={row.subtitle}
                        selected={selectedId === row.id}
                        onClick={() => toggle( row.id )}
                        actions={deleteAction( row )}
                        realtimeTrigger={row.id === traceId ? traceNonce : 0}
                    >
                        {tags( row )}
                    </RecordCard>
                ) )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <SectionLabel>
                Avatar media — the same card for a collection of people
            </SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: GRID_COLUMNS, gap: 2, alignItems: 'start', mb: 4 }}>
                <RecordCard
                    media={<Avatar sx={{ width: 48, height: 48, fontSize: 16, fontWeight: 600 }}>BL</Avatar>}
                    title="Brady Leach"
                    subtitle="Owner"
                    selected={selectedId === 'p1'}
                    onClick={() => toggle( 'p1' )}
                >
                    <Typography variant="body2" color="text.secondary">Last seen 2 days ago</Typography>
                </RecordCard>
                <RecordCard
                    media={<Avatar sx={{ width: 48, height: 48, fontSize: 16, fontWeight: 600 }}>AH</Avatar>}
                    title="Aiko Hayashi"
                    subtitle="Production"
                    selected={selectedId === 'p2'}
                    onClick={() => toggle( 'p2' )}
                >
                    <Typography variant="body2" color="text.secondary">Last seen 4 hours ago</Typography>
                </RecordCard>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <SectionLabel>
                No actions, not clickable — a read-only card keeps the same geometry
            </SectionLabel>
            <Box sx={{ maxWidth: 420, mb: 4 }}>
                <RecordCard
                    media={media( 'Castile', 'flask' )}
                    title="Castile Classic"
                    subtitle="Cold Process · 1,200 g oil"
                >
                    {tags( { id: 'ro', title: 'Castile Classic', tags: ['24 bars', 'NaOH'] } )}
                </RecordCard>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <SectionLabel>
                Narrow column — mobile width, where actions stay visible
            </SectionLabel>
            <Box sx={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {ROWS.slice( 0, 3 ).map( row => (
                    <RecordCard
                        key={row.id}
                        media={media( row.title, row.iconKey )}
                        title={row.title}
                        subtitle={row.subtitle}
                        selected={selectedId === row.id}
                        onClick={() => toggle( row.id )}
                        actions={deleteAction( row )}
                    >
                        {tags( row )}
                    </RecordCard>
                ) )}
            </Box>

            <PlaygroundDataPreview title="Rows" caption="The card renders what it is given; these are the fixtures." data={ROWS} />
        </Box>
    );
}
