import { Box, useTheme } from '@/components/ui';
import type { StateStepConfig } from './StateGraphViewer.types';

const SEGMENT_HEIGHT = 8;
const SEGMENT_GAP = 4;
const FUTURE_COLOR = '#e0e0e0';
const FUTURE_OPACITY = 0.5;
const TERMINAL_PAST_OPACITY = 0.6;

interface StateSegmentBarProps
{
    steps: StateStepConfig[];
    isTerminal: boolean;
}

export function StateSegmentBar( { steps, isTerminal }: StateSegmentBarProps )
{
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', gap: `${SEGMENT_GAP}px`, width: '100%' }}>
            {steps.map( ( step, i ) =>
            {
                let bgcolor: string;
                let opacity: number;

                if( step.status === 'pending' )
                {
                    bgcolor = FUTURE_COLOR;
                    opacity = FUTURE_OPACITY;
                }
                else
                {
                    bgcolor = ( theme.palette as Record<string, any> )[step.color]?.main ?? step.color;
                    opacity = isTerminal && step.status === 'completed'
                        ? TERMINAL_PAST_OPACITY
                        : 1.0;
                }

                return (
                    <Box
                        key={i}
                        sx={{
                            flex:         1,
                            height:       SEGMENT_HEIGHT,
                            borderRadius: SEGMENT_HEIGHT / 2,
                            bgcolor,
                            opacity,
                        }}
                    />
                );
            } )}
        </Box>
    );
}
