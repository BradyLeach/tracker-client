/**
 * CountMetric Playground
 *
 *  1. Variant side-by-side  — default vs compact, inactive and active.
 *  2. Badge matrix          — every direction × sentiment combination.
 *  3. Live filter demo      — useMetricFilter wired to mock rows.
 */

import { Box, Stack, Typography, Card } from '@/components/ui';
import { CountMetric } from '@/components/shared/metrics/CountMetric';
import { useMetricFilter } from '@/components/shared/metrics/useMetricFilter';
import type { MetricDefinition } from '@/components/shared/metrics/useMetricFilter';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SPARKLINE_SERIES = [
    { x: 'Jan', y: 3 },
    { x: 'Feb', y: 6 },
    { x: 'Mar', y: 4 },
    { x: 'Apr', y: 9 },
    { x: 'May', y: 7 },
    { x: 'Jun', y: 11 },
    { x: 'Jul', y: 8 },
];

const BADGE_MATRIX = [
    { label: 'Up / Positive', change: { value: 12, direction: 'up' as const, sentiment: 'positive' as const, unit: '%' } },
    { label: 'Up / Negative', change: { value: 8, direction: 'up' as const, sentiment: 'negative' as const, unit: '%' } },
    { label: 'Up / Neutral', change: { value: 3, direction: 'up' as const, sentiment: 'neutral' as const } },
    { label: 'Down / Positive', change: { value: 5, direction: 'down' as const, sentiment: 'positive' as const, unit: '%' } },
    { label: 'Down / Negative', change: { value: 9, direction: 'down' as const, sentiment: 'negative' as const, unit: '%' } },
    { label: 'Down / Neutral', change: { value: 2, direction: 'down' as const, sentiment: 'neutral' as const } },
];

// ─── Live filter demo ─────────────────────────────────────────────────────────

type MockRow = { id: string; status: 'active' | 'ended' | 'prospect' };

const MOCK_ROWS: MockRow[] = [
    { id: '1', status: 'active' },
    { id: '2', status: 'active' },
    { id: '3', status: 'active' },
    { id: '4', status: 'active' },
    { id: '5', status: 'prospect' },
    { id: '6', status: 'prospect' },
    { id: '7', status: 'ended' },
    { id: '8', status: 'ended' },
    { id: '9', status: 'ended' },
];

const METRIC_DEFINITIONS: MetricDefinition<MockRow>[] = [
    {
        key: 'all',
        label: 'Total',
        predicate: null,
    },
    {
        key: 'active',
        label: 'Active',
        predicate: row => row.status === 'active',
        change: { value: 12, direction: 'up', sentiment: 'positive', unit: '%' },
        series: SPARKLINE_SERIES,
    },
    {
        key: 'prospect',
        label: 'Prospect',
        predicate: row => row.status === 'prospect',
        change: { value: 1, direction: 'up', sentiment: 'neutral' },
    },
    {
        key: 'ended',
        label: 'Ended',
        predicate: row => row.status === 'ended',
        change: { value: 3, direction: 'down', sentiment: 'negative', unit: '%' },
    },
];

function LiveFilterDemo()
{
    const { metrics, visibleRows } = useMetricFilter( MOCK_ROWS, METRIC_DEFINITIONS );

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
                {metrics.map( metric => (
                    <CountMetric key={metric.label} variant="compact" {...metric} />
                ) )}
            </Stack>
            <Card sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                    Visible rows ({visibleRows.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {visibleRows.map( row => (
                        <Box
                            key={row.id}
                            sx={{ px: 1.5, py: 0.5, borderRadius: 0.5, bgcolor: 'grey.300', fontSize: 12, fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                            #{row.id} {row.status}
                        </Box>
                    ) )}
                </Stack>
            </Card>
        </Stack>
    );
}

// ─── Playground ───────────────────────────────────────────────────────────────

export function CountMetricPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>CountMetric</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 560 }}>
                Two variants: <code>default</code> (32px / 5rem) and <code>compact</code> (24px / 2.5rem).
                Direction drives the icon; sentiment drives the colour — independent.
            </Typography>

            {/* ── Section 1: default vs compact ─────────────────────────────── */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                default vs compact — inactive
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
                <CountMetric label="default" value={42} change={{ value: 12, direction: 'up', sentiment: 'positive', unit: '%' }} variant="default" active={false} onClick={() => undefined} />
                <CountMetric label="compact" value={42} change={{ value: 12, direction: 'up', sentiment: 'positive', unit: '%' }} variant="compact" active={false} onClick={() => undefined} />
            </Stack>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                default vs compact — active
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 5 }}>
                <CountMetric label="default" value={42} change={{ value: 12, direction: 'up', sentiment: 'positive', unit: '%' }} variant="default" active={true} onClick={() => undefined} />
                <CountMetric label="compact" value={42} change={{ value: 12, direction: 'up', sentiment: 'positive', unit: '%' }} variant="compact" active={true} onClick={() => undefined} />
            </Stack>

            {/* ── Section 2: Sparkline ──────────────────────────────────────── */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                With sparkline — inactive vs active
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 5 }}>
                <CountMetric label="Active Partners" value={8} change={{ value: 12, direction: 'up', sentiment: 'positive', unit: '%' }} series={SPARKLINE_SERIES} variant="default" active={false} onClick={() => undefined} />
                <CountMetric label="Active Partners" value={8} change={{ value: 12, direction: 'up', sentiment: 'positive', unit: '%' }} series={SPARKLINE_SERIES} variant="default" active={true} onClick={() => undefined} />
            </Stack>

            {/* ── Section 3: Badge matrix ───────────────────────────────────── */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                Badge — all direction × sentiment combinations
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 5 }}>
                {BADGE_MATRIX.map( example => (
                    <CountMetric key={example.label} label={example.label} value={42} change={example.change} variant="compact" active={false} onClick={() => undefined} />
                ) )}
            </Stack>

            {/* ── Section 4: Live filter ────────────────────────────────────── */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                Live filter — useMetricFilter wired to mock rows
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click a metric to filter. Click again to clear. Counts stay stable — always from raw rows.
            </Typography>
            <LiveFilterDemo />
        </Box>
    );
}
