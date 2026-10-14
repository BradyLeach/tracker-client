import { useState } from 'react';
import { Box, Stack, Typography, Button, Paper, Divider, Tooltip } from '@/components/ui';
import { StateGraphViewer } from '@/components/shared/stateGraphViewer';
import type { StateGraphViewerProps } from '@/components/shared/stateGraphViewer';

// ─── State category reference ─────────────────────────────────────────────────
//
//   new       → neutral   not yet started
//   active    → info      actively being worked on
//   on_hold   → info      paused, pending external input
//   stalled   → warning   blocked, impediment must be resolved
//   complete  → success   terminal — successfully done
//   cancelled → muted     terminal — deliberately stopped
//   failed    → danger    terminal — ended unsuccessfully
//
// Each step's color must match the state category it maps to.
// ─────────────────────────────────────────────────────────────────────────────

const SCENARIOS: Array<{ label: string; props: StateGraphViewerProps }> = [

    {
        label: '1. New — step 1 of 5, not yet started',
        props: {
            steps: [
                { label: 'New', color: 'neutral', status: 'active', isTerminal: false },
                { label: 'Ordered', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Available', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Allocated', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Packed', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Complete', color: 'success', status: 'pending', isTerminal: true },
            ],
            currentStep: 1,
            totalSteps:  5,
            isTerminal:  false,
            sublabel:    'Next: Ordered',
        },
    },

    {
        label: '2. Active — step 3 of 5, in progress',
        props: {
            steps: [
                { label: 'New', color: 'neutral', status: 'completed', isTerminal: false },
                { label: 'Ordered', color: 'info', status: 'completed', isTerminal: false },
                { label: 'Available', color: 'info', status: 'active', isTerminal: false },
                { label: 'Allocated', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Packed', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Complete', color: 'success', status: 'pending', isTerminal: true },
            ],
            currentStep: 3,
            totalSteps:  5,
            isTerminal:  false,
            sublabel:    'Next: Allocated',
        },
    },

    {
        label: '3. Stalled — step 4 of 5, blocked',
        props: {
            steps: [
                { label: 'New', color: 'neutral', status: 'completed', isTerminal: false },
                { label: 'Ordered', color: 'info', status: 'completed', isTerminal: false },
                { label: 'Available', color: 'info', status: 'completed', isTerminal: false },
                { label: 'Stalled', color: 'warning', status: 'active', isTerminal: false },
                { label: 'Packed', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Complete', color: 'success', status: 'pending', isTerminal: true },
            ],
            currentStep: 4,
            totalSteps:  5,
            isTerminal:  false,
            sublabel:    'Waiting on supplier',
        },
    },

    {
        label: '4. Terminal Success — complete, step 5 of 5',
        props: {
            steps: [
                { label: 'New', color: 'success', status: 'completed', isTerminal: false },
                { label: 'Ordered', color: 'success', status: 'completed', isTerminal: false },
                { label: 'Available', color: 'success', status: 'completed', isTerminal: false },
                { label: 'Allocated', color: 'success', status: 'completed', isTerminal: false },
                { label: 'Packed', color: 'success', status: 'completed', isTerminal: false },
                { label: 'Complete', color: 'success', status: 'active', isTerminal: true },
            ],
            currentStep: 5,
            totalSteps:  5,
            isTerminal:  true,
            sublabel:    'Done ✓',
        },
    },

    {
        label: '5. Terminal Failure — failed at step 3 of 5',
        props: {
            steps: [
                { label: 'New', color: 'danger', status: 'completed', isTerminal: false },
                { label: 'Ordered', color: 'danger', status: 'completed', isTerminal: false },
                { label: 'Failed', color: 'danger', status: 'active', isTerminal: true },
                { label: 'Allocated', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Packed', color: 'info', status: 'pending', isTerminal: false },
                { label: 'Complete', color: 'success', status: 'pending', isTerminal: true },
            ],
            currentStep: 3,
            totalSteps:  5,
            isTerminal:  true,
            sublabel:    'Failed',
        },
    },

];

// ─── Playground ───────────────────────────────────────────────────────────────

export function StateGraphViewerPlayground()
{
    const [ index, setIndex ] = useState( 0 );
    const { label: _label, props } = SCENARIOS[index];

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>StateGraphViewer</Typography>

            {/* Scenario selector */}
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
                {SCENARIOS.map( ( s, i ) => (
                    <Tooltip key={i} title={s.label} arrow>
                        <Button
                            size="small"
                            variant={i === index ? 'contained' : 'outlined'}
                            onClick={() => setIndex( i )}
                        >
                            v{i + 1}
                        </Button>
                    </Tooltip>
                ) )}
            </Stack>

            {/* Component */}
            <Paper sx={{ px: 3, py: 2, mb: 3, display: 'flex', alignItems: 'center', minHeight: 100 }}>
                <StateGraphViewer {...props} />
            </Paper>

            {/* Config */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Props
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Typography
                    component="pre"
                    fontFamily="monospace"
                    fontSize={11}
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', m: 0 }}
                >
                    {JSON.stringify( props, null, 2 )}
                </Typography>
            </Paper>
        </Box>
    );
}
