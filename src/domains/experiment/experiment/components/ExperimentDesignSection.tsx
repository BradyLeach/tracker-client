/**
 * ExperimentDesignSection
 *
 * The experiment's stated design: the hypothesis, the success threshold with its
 * direction, and the window. Read-only here — a draft's design is edited through the
 * header's edit action, and a running or finished experiment's design is locked, which
 * this section says rather than leaving the user to discover it.
 *
 * The threshold is shown as the server stores it, a whole number in the primary
 * measure's unit and scale.
 */

import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@/components/ui';
import { ProfileSection } from '@/components/container/ProfileSection';
import { experimentPhase } from '../orchestrators/experiments.orchestrator';
import type { Experiment } from '../types/experiment.types';

export interface ExperimentDesignSectionProps
{
    experiment: Experiment;
}

/** A UTC window bound, read as a local date. */
function displayDate( value: string | undefined ): string | undefined
{
    if( !value ) return undefined;
    const date = new Date( value );
    return Number.isNaN( date.getTime() ) ? undefined : date.toLocaleDateString();
}

function DesignRow( { label, children }: { label: string; children: React.ReactNode } )
{
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px minmax(0, 1fr)' }, gap: 1, py: 1 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>{children}</Typography>
        </Box>
    );
}

export function ExperimentDesignSection( { experiment }: ExperimentDesignSectionProps )
{
    const { t } = useTranslation();
    const phase = experimentPhase( experiment );
    const notSet = t( 'pages.experiment.design.notSet' );

    const threshold = experiment.thresholdValue === undefined || experiment.thresholdValue === null
        ? notSet
        : [
            experiment.thresholdDirection ? t( `pages.experiment.design.${experiment.thresholdDirection}` ) : undefined,
            experiment.thresholdValue.toLocaleString(),
        ].filter( Boolean ).join( ' ' );

    const start = displayDate( experiment.windowStart );
    const end = displayDate( experiment.windowEnd );
    const window = start || end ? `${start ?? notSet} – ${end ?? notSet}` : notSet;

    const lockedNote = phase === 'running'
        ? t( 'pages.experiment.design.lockedRunning' )
        : phase === 'concluded' || phase === 'abandoned' ? t( 'pages.experiment.design.lockedTerminal' ) : undefined;

    return (
        <ProfileSection title={t( 'pages.experiment.section.design' )}>
            <DesignRow label={t( 'pages.experiment.design.hypothesis' )}>{experiment.hypothesis}</DesignRow>
            <DesignRow label={t( 'pages.experiment.design.threshold' )}>{threshold}</DesignRow>
            <DesignRow label={t( 'pages.experiment.design.window' )}>{window}</DesignRow>

            {lockedNote && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {lockedNote}
                </Typography>
            )}
        </ProfileSection>
    );
}
