import { useState } from 'react';
import { Box, Card, Typography } from '@/components/ui';
import { DimensionFilterEditor } from '@/domains/metric/metric/components/DimensionFilterEditor';
import type { DimensionFilter } from '@/domains/metric';

// A push source that may write these dimensions — the only keys a filter may reference.
const ALLOWED_DIMENSION_KEYS = ['utm_source', 'utm_medium', 'landing_page'];

const STARTING_FILTERS: DimensionFilter[] = [
    { target: 'campaignKey', operator: 'equals', values: ['newsletter-oct'] },
    { target: 'dimension', dimensionKey: 'utm_source', operator: 'in', values: ['beehiiv', 'substack'] },
];

// ─── Playground ───────────────────────────────────────────────────────────────

export function DimensionFilterEditorPlayground()
{
    const [filters, setFilters] = useState<DimensionFilter[]>( STARTING_FILTERS );
    const [empty, setEmpty] = useState<DimensionFilter[]>( [] );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>DimensionFilterEditor Playground</Typography>

            {/* ── With filters ── */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Campaign key and dimension filters</Typography>
                <DimensionFilterEditor value={filters} onChange={setFilters} allowedDimensionKeys={ALLOWED_DIMENSION_KEYS} />
                <Box component="pre" sx={{ mt: 2, fontSize: 12 }}>{JSON.stringify( filters, null, 2 )}</Box>
            </Card>

            {/* ── A source with no allowed dimensions: only the campaign key can be matched ── */}
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>No allowed dimension keys</Typography>
                <DimensionFilterEditor value={empty} onChange={setEmpty} allowedDimensionKeys={[]} />
            </Card>
        </Box>
    );
}
