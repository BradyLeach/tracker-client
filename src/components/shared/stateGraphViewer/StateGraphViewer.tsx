import { Stack, Typography } from '@/components/ui';
import { StateProgressBadge } from './StateProgressBadge';
import { StateSegmentBar } from './StateSegmentBar';
import type { StateGraphViewerProps } from './StateGraphViewer.types';

export function StateGraphViewer( { steps, currentStep, totalSteps, isTerminal, sublabel }: StateGraphViewerProps )
{
    const activeStep = steps.find( s => s.status === 'active' );
    const percentage = ( currentStep / totalSteps ) * 100;
    const badgeColor = activeStep?.color ?? 'grey';

    return (
        <Stack direction="row" alignItems="center" spacing={2} width="100%">
            <StateProgressBadge percentage={percentage} color={badgeColor} />

            <Stack flex={1} spacing={0.5} minWidth={0}>
                <StateSegmentBar steps={steps} isTerminal={isTerminal} />

                <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {activeStep?.label ?? ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                        {currentStep} of {totalSteps}
                    </Typography>
                </Stack>

                {sublabel && (
                    <Typography variant="body2" color="text.secondary">
                        {sublabel}
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
}
