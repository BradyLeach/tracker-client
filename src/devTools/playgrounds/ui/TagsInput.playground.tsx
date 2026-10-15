import { useState } from 'react';
import { Box, Stack, Typography, Card, TagsInput } from '@/components/ui';

// A source's allowed measurement names — the shape TagsInput edits.
const ALLOWED_NAMES = ['pageview', 'signup'];
const SUGGESTIONS = ['pageview', 'signup', 'purchase', 'refund'];

// ─── Playground ───────────────────────────────────────────────────────────────

export function TagsInputPlayground()
{
    const [ names, setNames ] = useState<string[]>( ALLOWED_NAMES );
    const [ free, setFree ] = useState<string[]>( [] );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>TagsInput Playground</Typography>

            {/* ── With suggestions ── */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>With suggestions</Typography>
                <Stack spacing={2} sx={{ maxWidth: 480 }}>
                    <TagsInput value={names} onChange={setNames} suggestions={SUGGESTIONS} placeholder="Add a name" />
                    <Typography variant="body2" color="text.secondary">Value: {JSON.stringify( names )}</Typography>
                </Stack>
            </Card>

            {/* ── Free entry ── */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Free entry, empty</Typography>
                <Stack spacing={2} sx={{ maxWidth: 480 }}>
                    <TagsInput value={free} onChange={setFree} placeholder="Type a value and press Enter" />
                    <Typography variant="body2" color="text.secondary">Value: {JSON.stringify( free )}</Typography>
                </Stack>
            </Card>

            {/* ── States ── */}
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>States</Typography>
                <Stack spacing={2} sx={{ maxWidth: 480 }}>
                    <TagsInput value={ALLOWED_NAMES} onChange={() => undefined} disabled />
                    <TagsInput value={[]} onChange={() => undefined} error helperText="At least one name is required" />
                </Stack>
            </Card>
        </Box>
    );
}
