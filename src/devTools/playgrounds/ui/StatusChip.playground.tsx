import { Box, Stack, Typography, Card } from '@/components/ui';
import { StatusChip } from '@/components/shared/status';
import { STATE_CATEGORY_COLORS } from '@/config/stateCategory.config';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const EXAMPLES = Object.entries( STATE_CATEGORY_COLORS ).map( ( [key, colour] ) => ( {
    stateName: key,
    stateCategoryColour: colour,
} ) );

// ─── Playground ───────────────────────────────────────────────────────────────

export function StatusChipPlayground()
{
    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>StatusChip</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                One chip per state category. Shows props in → visual result out.
            </Typography>

            <Stack spacing={2}>
                {EXAMPLES.map( props => (
                    <Card key={props.stateCategoryColour} sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={4}>

                            {/* Props in */}
                            <Box
                                component="pre"
                                sx={{
                                    m: 0,
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'grey.100',
                                    fontSize: 12,
                                    fontFamily: 'monospace',
                                    color: 'text.secondary',
                                    minWidth: 320,
                                    flexShrink: 0,
                                }}
                            >
                                {JSON.stringify( props, null, 2 )}
                            </Box>

                            {/* Visual result */}
                            <StatusChip {...props} />

                        </Stack>
                    </Card>
                ) )}
            </Stack>
        </Box>
    );
}
