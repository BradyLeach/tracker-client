/**
 * ExperimentLearningsSection
 *
 * What this experiment showed, newest first. Concluding records a learning, so a
 * running experiment's section is empty and says how it fills.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, EmptyState, Typography } from '@/components/ui';
import { ProfileSection } from '@/components/container/ProfileSection';
import type { Learning } from '../types/learning.types';

export interface ExperimentLearningsSectionProps
{
    learnings: Learning[];
}

export function ExperimentLearningsSection( { learnings }: ExperimentLearningsSectionProps )
{
    const { t } = useTranslation();

    const newestFirst = useMemo(
        () => [...learnings].sort( ( first, second ) => ( second.createdAt ?? '' ).localeCompare( first.createdAt ?? '' ) ),
        [learnings],
    );

    return (
        <ProfileSection title={t( 'pages.experiment.section.learnings' )}>
            {newestFirst.length === 0
                ? (
                    <EmptyState
                        size="compact"
                        icon="bulb"
                        headline={t( 'pages.experiment.learnings.emptyState.headline' )}
                        subtext={t( 'pages.experiment.learnings.emptyState.subtext' )}
                        actions={[]}
                    />
                )
                : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {newestFirst.map( learning => (
                            <Box key={learning.id}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{learning.body}</Typography>
                                {learning.createdAt && (
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date( learning.createdAt ).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Box>
                        ) )}
                    </Box>
                )}
        </ProfileSection>
    );
}
