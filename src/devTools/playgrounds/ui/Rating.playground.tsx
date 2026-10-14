import { useState } from 'react';
import { Box, Stack, Typography, Card, Slider, Select, MenuItem } from '@/components/ui';
import { Rating } from '@/components/ui/data-display/Rating';

const SIZES = ['small', 'medium', 'large'] as const;
const MAX_OPTIONS = [3, 5, 10] as const;

// ─── Playground ───────────────────────────────────────────────────────────────

export function RatingPlayground()
{
    const [ value, setValue ] = useState<number>( 3 );
    const [ max, setMax ] = useState<number>( 5 );
    const [ size, setSize ] = useState<'small' | 'medium' | 'large'>( 'small' );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Rating Playground</Typography>

            {/* ── Controls ── */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Controls</Typography>
                <Stack spacing={3} sx={{ maxWidth: 400 }}>

                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Value: {value} / {max}
                        </Typography>
                        <Slider
                            value={value}
                            min={0}
                            max={max}
                            step={1}
                            marks
                            onChange={( _, v ) => setValue( v as number )}
                        />
                    </Box>

                    <Stack direction="row" spacing={3} alignItems="center">
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>Max</Typography>
                            <Select
                                size="small"
                                value={max}
                                onChange={e =>
                                {
                                    const newMax = Number( e.target.value );
                                    setMax( newMax );
                                    if( value > newMax ) setValue( newMax );
                                }}
                            >
                                {MAX_OPTIONS.map( m => (
                                    <MenuItem key={m} value={m}>{m} stars</MenuItem>
                                ) )}
                            </Select>
                        </Box>

                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>Size</Typography>
                            <Select
                                size="small"
                                value={size}
                                onChange={e => setSize( e.target.value as typeof size )}
                            >
                                {SIZES.map( s => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ) )}
                            </Select>
                        </Box>
                    </Stack>
                </Stack>
            </Card>

            {/* ── Live preview ── */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Live Preview</Typography>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>Read-only</Typography>
                        <Rating value={value} max={max} size={size} readOnly />
                        <Typography variant="body2">({value} / {max})</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 90 }}>Interactive</Typography>
                        <Rating
                            value={value}
                            max={max}
                            size={size}
                            onChange={( _, v ) => setValue( v ?? 0 )}
                        />
                        <Typography variant="body2">({value} / {max})</Typography>
                    </Stack>
                </Stack>
            </Card>

            {/* ── All values matrix ── */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>All Values (read-only, size: {size})</Typography>
                <Stack spacing={1}>
                    {Array.from( { length: max + 1 }, ( _, i ) => i ).map( v => (
                        <Stack key={v} direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" color="text.secondary" sx={{ width: 24, textAlign: 'right' }}>
                                {v}
                            </Typography>
                            <Rating value={v} max={max} size={size} readOnly />
                        </Stack>
                    ) )}
                </Stack>
            </Card>

            {/* ── Size comparison at current value ── */}
            <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Size Comparison (value: {value})</Typography>
                <Stack spacing={2}>
                    {SIZES.map( s => (
                        <Stack key={s} direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2" color="text.secondary" sx={{ width: 60 }}>{s}</Typography>
                            <Rating value={value} max={max} size={s} readOnly />
                        </Stack>
                    ) )}
                </Stack>
            </Card>
        </Box>
    );
}
