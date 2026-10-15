/**
 * ExperimentVariantsSection
 *
 * The control and the variants it is compared against, control first. Each row says
 * which sources it counts measurements from, since a variant with no attribution counts
 * nothing and reads as broken in the results otherwise.
 *
 * Variants change only while the experiment is a draft: `editable` gates the add and
 * edit actions, and the server enforces the same rule.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box, Chip, EmptyState, IconButton, IconRenderer, List, ListItemButton, ListItemText, ResponsiveButton, Tooltip,
} from '@/components/ui';
import { ProfileSection } from '@/components/container/ProfileSection';
import type { MeasurementSource } from '@/domains/measurement';
import type { ExperimentVariant } from '../types/experimentVariant.types';

export interface ExperimentVariantsSectionProps
{
    variants: ExperimentVariant[];
    sources: readonly MeasurementSource[];
    editable: boolean;
    onAdd: () => void;
    onEdit: ( variant: ExperimentVariant ) => void;
    onDelete: ( variant: ExperimentVariant ) => void;
}

export function ExperimentVariantsSection( {
    variants, sources, editable, onAdd, onEdit, onDelete,
}: ExperimentVariantsSectionProps )
{
    const { t } = useTranslation();

    const sourceNames = useMemo(
        () => new Map( sources.map( source => [source.id, source.label ?? source.key] ) ),
        [sources],
    );

    /** Control first, then the variants in the order they were added. */
    const ordered = useMemo(
        () => [...variants].sort( ( first, second ) =>
            Number( second.isControl ) - Number( first.isControl )
            || ( first.createdAt ?? '' ).localeCompare( second.createdAt ?? '' ) ),
        [variants],
    );

    const attributionSummary = ( variant: ExperimentVariant ) => variant.attribution.length === 0
        ? t( 'pages.experiment.variants.noAttribution' )
        : variant.attribution
            .map( entry => sourceNames.get( entry.measurementSourceId ) ?? entry.measurementSourceId )
            .join( ', ' );

    return (
        <ProfileSection
            title={t( 'pages.experiment.section.variants' )}
            action={editable && (
                <ResponsiveButton
                    variant="outlined"
                    color="primary"
                    size="small"
                    iconKey="plus"
                    label={t( 'pages.experiment.variants.addButton' )}
                    onClick={onAdd}
                />
            )}
            disableBodyPadding
        >
            {ordered.length === 0
                ? (
                    <EmptyState
                        size="compact"
                        icon="flask"
                        headline={t( 'pages.experiment.variants.emptyState.headline' )}
                        subtext={t( 'pages.experiment.variants.emptyState.subtext' )}
                        actions={editable
                            ? [{ label: t( 'pages.experiment.variants.addButton' ), variant: 'contained', onClick: onAdd }]
                            : []}
                    />
                )
                : (
                    <List disablePadding>
                        {ordered.map( variant => (
                            <Box key={variant.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                <ListItemButton disabled={!editable} onClick={() => onEdit( variant )}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {variant.label}
                                                {variant.isControl && (
                                                    <Chip size="small" label={t( 'pages.experiment.variants.control' )} />
                                                )}
                                            </Box>
                                        }
                                        secondary={attributionSummary( variant )}
                                    />
                                </ListItemButton>
                                {editable && (
                                    <Tooltip title={t( 'shared.buttons.delete' )}>
                                        <IconButton
                                            size="small"
                                            aria-label={t( 'shared.buttons.delete' )}
                                            onClick={() => onDelete( variant )}
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
