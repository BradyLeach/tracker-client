import { Box, Card, ChartsReferenceLine, LineChart, Typography } from '@/components/ui';

// A daily conversion-rate trend at RATIO_SCALE (250 = 2.50%) against a 2.50% threshold.
const PERIODS = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];
const CONTROL = [180, 205, 0, 240, 230];
const VARIANT = [260, 300, 290, null, 330];
const THRESHOLD = 250;

// ─── Playground ───────────────────────────────────────────────────────────────

export function LineChartPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>LineChart Playground</Typography>

            {/* ── Trend against a threshold ── */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Two series against a threshold (a gap where a value is unknown)</Typography>
                <LineChart
                    height={260}
                    xAxis={[{ scaleType: 'point', data: PERIODS }]}
                    series={[
                        { data: CONTROL, label: 'Control', connectNulls: false },
                        { data: VARIANT, label: 'Variant', connectNulls: false },
                    ]}
                >
                    <ChartsReferenceLine y={THRESHOLD} label="Threshold" />
                </LineChart>
            </Card>

            {/* ── Empty ── */}
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>No data</Typography>
                <LineChart height={200} xAxis={[{ scaleType: 'point', data: [] }]} series={[{ data: [] }]} />
            </Card>
        </Box>
    );
}
