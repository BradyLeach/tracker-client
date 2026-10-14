/**
 * CountMetric
 *
 * Generic KPI card: label on top, large monospace value + change badge on the same
 * baseline below, optional sparkline at the bottom.
 *
 * Variants:
 *   default — 32px padding, 5rem value
 *   compact — 24px padding, 3.5rem value
 *
 * Badge format: trend icon + signed value with optional unit (e.g. ↗ +12%)
 */

import { Card, Box, Stack, Typography, useTheme, alpha, SparkLine, IconRenderer } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CountMetricVariant = 'default' | 'compact';

export interface CountMetricChange
{
    /** Magnitude of the change — always positive. Sign is derived from direction. */
    value: number;
    /** Drives the trend icon and sign: up = ↗ +, down = ↘ -. */
    direction: 'up' | 'down';
    /** Drives badge colour: green, red, or neutral. Independent of direction. */
    sentiment: 'positive' | 'negative' | 'neutral';
    /** Unit suffix for badge display (e.g. '%'). Appears as '+12%' in badge. */
    unit?: string;
}

export interface CountMetricProps
{
    label: string;
    value: number;
    change?: CountMetricChange;
    series?: { x: string | number; y: number }[];
    variant?: CountMetricVariant;
    active: boolean;
    onClick: () => void;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_CONFIG = {
    default: { p: 2.5, valueSize: '1.625rem', cardWidthWithSeries: 220, sparklineHeight: 48 },
    compact: { p: 2, valueSize: '1.375rem', cardWidthWithSeries: 200, sparklineHeight: 40 },
} satisfies Record<CountMetricVariant, { p: number; valueSize: string; cardWidthWithSeries: number; sparklineHeight: number }>;

// ─── Component ────────────────────────────────────────────────────────────────

export function CountMetric( {
    label,
    value,
    change,
    series,
    variant = 'default',
    active,
    onClick,
}: CountMetricProps )
{
    const theme = useTheme();
    const config = VARIANT_CONFIG[variant];

    const sentimentColor = !change
        ? undefined
        : change.sentiment === 'positive' ? theme.palette.success.main
            : change.sentiment === 'negative' ? theme.palette.error.main
                : theme.palette.text.secondary;

    const sparklineColor = theme.palette.graphite;

    const badgeText = change
        ? `${change.direction === 'up' ? '+' : '-'}${change.value}${change.unit ?? ''}`
        : '';

    return (
        <Card
            onClick={onClick}
            // elevation={4}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                p: config.p,
                minWidth: series ? config.cardWidthWithSeries : 120,
                overflow: series ? 'hidden' : undefined,
                cursor: 'pointer',
                border: active ? '1px solid' : 'none',
                borderColor: active ? 'graphite' : 'none',
                transition: 'transform 150ms ease, border-color 150ms ease',
                '&:hover': {
                    transform: 'translateY(-2px)'
                },
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    mb: 2,
                    color: 'text.muted',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    lineHeight: 1,
                    fontSize: '0.625rem',
                    fontWeight: 400,
                }}
            >
                {label}
            </Typography>

            <Stack direction="row" alignItems="center" sx={{ gap: 1.25, mt: 0.75 }}>
                <Typography
                    component="span"
                    sx={{
                        fontSize: config.valueSize,
                        fontWeight: 600,
                        fontFamily: ( t ) => t.typography.fontFamilyMono,
                        lineHeight: 1,
                        letterSpacing: 'normal',
                        color: 'text.primary',
                    }}
                >
                    {value}
                </Typography>

                {change && sentimentColor && (
                    <Box
                        component="span"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            borderRadius: '4px',
                            py: 0.4,
                            px: 1,
                            bgcolor: alpha( sentimentColor, 0.12 ),
                            border: `1px solid ${alpha( sentimentColor, 0.3 )}`,
                            fontSize: '0.6875rem',
                            fontFamily: ( t ) => t.typography.fontFamilyMono,
                            fontWeight: 500,
                            color: sentimentColor,
                            lineHeight: 1.5,
                            userSelect: 'none',
                        }}
                    >
                        <IconRenderer
                            iconKey={change.direction === 'up' ? 'trendingUp' : 'trendingDown'}
                            size={24}
                            color={sentimentColor}
                        />
                        {badgeText}
                    </Box>
                )}
            </Stack>

            {series && (
                <Box sx={{ mt: 1.5, mx: -config.p }}>
                    <SparkLine
                        data={series.map( p => p.y )}
                        width={config.cardWidthWithSeries}
                        height={config.sparklineHeight}
                        color={sparklineColor}
                        curve="catmullRom"
                        showHighlight={false}
                        showTooltip={false}
                    />
                </Box>
            )}
        </Card>
    );
}
