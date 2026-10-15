/**
 * ExperimentMeasuresSection
 *
 * What the experiment measures, primary first. Each row names its target — the metric,
 * the formula, or the calculator — so the list reads without opening each measure.
 *
 * Measures change only while the experiment is a draft: `editable` gates the add and
 * edit actions, and the server enforces the same rule.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box, Chip, EmptyState, IconButton, IconRenderer, List, ListItemButton, ListItemText, ResponsiveButton, Tooltip,
} from '@/components/ui';
import { ProfileSection } from '@/components/container/ProfileSection';
import type { Formula, Metric } from '@/domains/metric';
import type { ExperimentMeasure } from '../types/experimentMeasure.types';

export interface ExperimentMeasuresSectionProps
{
    measures: ExperimentMeasure[];
    metrics: readonly Metric[];
    formulas: readonly Formula[];
    editable: boolean;
    onAdd: () => void;
    onEdit: ( measure: ExperimentMeasure ) => void;
    onDelete: ( measure: ExperimentMeasure ) => void;
}

export function ExperimentMeasuresSection( {
    measures, metrics, formulas, editable, onAdd, onEdit, onDelete,
}: ExperimentMeasuresSectionProps )
{
    const { t } = useTranslation();

    const metricNames = useMemo( () => new Map( metrics.map( metric => [metric.id, metric.label ?? metric.key] ) ), [metrics] );
    const formulaNames = useMemo(
        () => new Map( formulas.map( formula => [formula.id, formula.label ?? formula.key] ) ),
        [formulas],
    );

    /** Primary first, then the measures in the order they were added. */
    const ordered = useMemo(
        () => [...measures].sort( ( first, second ) =>
            Number( second.isPrimary ) - Number( first.isPrimary )
            || ( first.createdAt ?? '' ).localeCompare( second.createdAt ?? '' ) ),
        [measures],
    );

    /** The metric, formula or calculator the measure reads. */
    const targetName = ( measure: ExperimentMeasure ) =>
    {
        if( measure.measureType === 'metric' ) return metricNames.get( measure.metricId ?? '' );
        if( measure.measureType === 'formula' ) return formulaNames.get( measure.formulaId ?? '' );
        return measure.calculatorKey ? t( `calculators.names.${measure.calculatorKey}` ) : undefined;
    };

    return (
        <ProfileSection
            title={t( 'pages.experiment.section.measures' )}
            action={editable && (
                <ResponsiveButton
                    variant="outlined"
                    color="primary"
                    size="small"
                    iconKey="plus"
                    label={t( 'pages.experiment.measures.addButton' )}
                    onClick={onAdd}
                />
            )}
            disableBodyPadding
        >
            {ordered.length === 0
                ? (
                    <EmptyState
                        size="compact"
                        icon="chartLine"
                        headline={t( 'pages.experiment.measures.emptyState.headline' )}
                        subtext={t( 'pages.experiment.measures.emptyState.subtext' )}
                        actions={editable
                            ? [{ label: t( 'pages.experiment.measures.addButton' ), variant: 'contained', onClick: onAdd }]
                            : []}
                    />
                )
                : (
                    <List disablePadding>
                        {ordered.map( measure => (
                            <Box key={measure.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                <ListItemButton disabled={!editable} onClick={() => onEdit( measure )}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {measure.label ?? targetName( measure ) ?? '—'}
                                                {measure.isPrimary && (
                                                    <Chip
                                                        size="small"
                                                        color="primary"
                                                        label={t( 'pages.experiment.measures.primary' )}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={[
                                            t( `forms.experimentMeasure.options.${measure.measureType}` ),
                                            measure.label ? targetName( measure ) : undefined,
                                        ].filter( Boolean ).join( ' · ' )}
                                    />
                                </ListItemButton>
                                {editable && (
                                    <Tooltip title={t( 'shared.buttons.delete' )}>
                                        <IconButton
                                            size="small"
                                            aria-label={t( 'shared.buttons.delete' )}
                                            onClick={() => onDelete( measure )}
                                            sx={{ mr: 1 }}
                                        >
                                            <IconRenderer iconKey="trash" size={16} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        ) )}
                    </List>
                )}
        </ProfileSection>
    );
}
