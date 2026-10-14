/**
 * RecordCard
 *
 * One record as a card, replacing its table row. The structure every record
 * collection shares:
 *
 *   header   icon tile, title, subtitle, row actions
 *   content  whatever the domain puts there, at a fixed height
 *
 * Domain-agnostic on purpose. Every collection page follows the same flow —
 * list, select, peek in a panel, open in full — so selection, hover reveal,
 * touch behaviour and the realtime trace live here once and the domain varies
 * only what it puts in the slots.
 *
 * The whole card is the click target, matching the table row it replaces, and
 * carries the same selected marker so selection reads identically in either view.
 *
 * @example
 * ```tsx
 * <RecordCard
 *     media={<Avatar variant="rounded"><IconRenderer iconKey="building" /></Avatar>}
 *     title={company.name}
 *     subtitle={displayHost( company.websiteUrl )}
 *     selected={selected}
 *     onClick={() => onClick?.( company )}
 *     realtimeTrigger={realtimeTrigger}
 *     actions={<IconButton onClick={stopAndDelete}>…</IconButton>}
 * >
 *     <PartnershipTypeBadges partnerships={partnerships} />
 * </RecordCard>
 * ```
 */

import type { ReactNode } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
} from '@/components/ui';
import { useRealtimeAnimation } from '@/components/shared/realtime';
import { useIsDesktop } from '@/hooks/useIsDesktop';

export interface RecordCardProps
{
    /**
     * The record's visual identity — an icon `Avatar`, a profile picture, a logo. Any node,
     * because half of these are profile pictures and half are type icons, and the
     * card has no business knowing which.
     */
    media?: ReactNode;
    /** Record name. */
    title: string;
    /** Second line under the title. A node, so a domain can compose it. */
    subtitle?: ReactNode;
    /**
     * Row actions. This card owns the reveal and the touch behaviour; the caller
     * supplies the buttons and stops propagation on each, since acting on a
     * record is not selecting it.
     */
    actions?: ReactNode;
    /** The content row beneath the header. */
    children?: ReactNode;
    selected?: boolean;
    onClick?: () => void;
    /**
     * Changing this runs the realtime trace around the card. The page decides which
     * record changed; the card decides that its own boundary is the trace boundary.
     */
    realtimeTrigger?: number | string;
}

/** One horizontal inset for every row, so the rows share an edge. */
const PAD_X = 2.5;

/** Content height plus the row's vertical padding. */
const CONTENT_ROW_HEIGHT = 51;

export function RecordCard( {
    media,
    title,
    subtitle,
    actions,
    children,
    selected = false,
    onClick,
    realtimeTrigger,
}: RecordCardProps )
{
    // Touch-first: a control you can only reach by hovering does not exist on a phone or
    // tablet, so it stays visible there unconditionally. Hover-reveal is a desktop-only
    // refinement layered on top, never the only way in.
    const isDesktop = useIsDesktop();

    const realtimeClass = useRealtimeAnimation( realtimeTrigger );

    return (
        <Card
            className={realtimeClass}
            onClick={onClick}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                cursor: onClick ? 'pointer' : 'default',
                border: '1px solid',
                borderColor: selected ? 'graphite' : 'border.base',
                backgroundColor: selected ? 'selected.bg' : 'background.paper',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
                '&:hover': { borderColor: 'graphite' },
                '&:hover .record-card-actions': { opacity: 1 },
            }}
        >
            {/* Identity */}
            <CardHeader
                avatar={media}
                title={
                    <Typography
                        variant="subtitle1"
                        noWrap
                        // Truncated names are unreadable without this.
                        title={title}
                        // The theme uppercases subtitles; a record name is a
                        // proper noun and reads as shouting in caps.
                        sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'none', lineHeight: 1.3 }}
                    >
                        {title}
                    </Typography>
                }
                subheader={
                    subtitle
                        ? (
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ textTransform: 'none' }}>
                                {subtitle}
                            </Typography>
                        )
                        : undefined
                }
                action={actions && (
                    <Box
                        className="record-card-actions"
                        sx={{
                            display: 'flex',
                            gap: 0.5,
                            // Touch-first: visible unconditionally below desktop, where
                            // hover does not exist to reveal it.
                            opacity: isDesktop ? 0 : 1,
                            transition: 'opacity 0.15s ease',
                        }}
                    >
                        {actions}
                    </Box>
                )}
                // minWidth:0 lets noWrap actually truncate instead of widening the card.
                slotProps={{ content: { sx: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 } } }}
                // A one-step surface change separates identity from the rest.
                // `sunk` is the theme's existing single step and inverts
                // correctly: warmer in light, lighter in dark. No rule needed —
                // a border here reads as two stacked panels.
                sx={{
                    px: PAD_X,
                    pt: 2,
                    pb: 2,
                    backgroundColor: 'background.sunk',
                    borderBottom: 'none',
                }}
            />

            {/* Fixed height so a record with nothing to show here leaves the same
                gap — cards in a grid stay on one baseline. */}
            <CardContent
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: CONTENT_ROW_HEIGHT,
                    px: PAD_X,
                    py: 0.75,
                    '&:last-child': { pb: 0.75 },
                }}
            >
                {children}
            </CardContent>
        </Card>
    );
}
