/**
 * PageExperiment
 *
 * One experiment, end to end: its design, the control and variants it compares, what it
 * measures, how it is doing against its threshold, and what it showed.
 *
 * The collection answers "which experiment"; this page is where one is built, run and
 * concluded. What can change follows its phase — a draft's design, variants and measures
 * are editable, a running experiment is concluded or abandoned, a finished one is read.
 *
 * Composition only. Each section takes data as props and owns its loading and empty
 * state, so a slow or missing read hides that section's content, never the page.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Page } from '@/components/container/Page';
import { NavbarLayout } from '@/components/container/NavbarLayout';
import { Box, Button, EmptyState, Skeleton, Typography } from '@/components/ui';
import { MessageDialog } from '@/components/ui/MessageDialog';
import { formatApiError } from '@/core/utils';
import { useMeasurementSources } from '@/domains/measurement';
import { useFormulas, useMetrics } from '@/domains/metric';
import type { ResultGrouping } from '@/domains/metric';
import { useExperiment } from '../experiment/hooks/useExperiment';
import { useExperimentResults } from '../experiment/hooks/useExperimentResults';
import { useStartExperiment } from '../experiment/hooks/useStartExperiment';
import { useAbandonExperiment } from '../experiment/hooks/useAbandonExperiment';
import { experimentPhase } from '../experiment/orchestrators/experiments.orchestrator';
import { ExperimentProfileHeader } from '../experiment/components/ExperimentProfileHeader';
import { ExperimentDesignSection } from '../experiment/components/ExperimentDesignSection';
import { ExperimentResultsSection } from '../experiment/components/ExperimentResultsSection';
import { ExperimentDialog } from '../experiment/components/ExperimentDialog';
import { ConcludeExperimentDialog } from '../experiment/components/ConcludeExperimentDialog';
import { DeleteExperimentDialog } from '../experiment/components/DeleteExperimentDialog';
import { useExperimentVariantsByExperiment } from '../experimentVariant/hooks/useExperimentVariantsByExperiment';
import { useDeleteExperimentVariant } from '../experimentVariant/hooks/useDeleteExperimentVariant';
import { ExperimentVariantsSection } from '../experimentVariant/components/ExperimentVariantsSection';
import { ExperimentVariantDialog } from '../experimentVariant/components/ExperimentVariantDialog';
import { useExperimentMeasuresByExperiment } from '../experimentMeasure/hooks/useExperimentMeasuresByExperiment';
import { useDeleteExperimentMeasure } from '../experimentMeasure/hooks/useDeleteExperimentMeasure';
import { ExperimentMeasuresSection } from '../experimentMeasure/components/ExperimentMeasuresSection';
import { ExperimentMeasureDialog } from '../experimentMeasure/components/ExperimentMeasureDialog';
import { useLearningsByExperiment } from '../learning/hooks/useLearningsByExperiment';
import { ExperimentLearningsSection } from '../learning/components/ExperimentLearningsSection';
import type { ExperimentVariant } from '../experimentVariant/types/experimentVariant.types';
import type { ExperimentMeasure } from '../experimentMeasure/types/experimentMeasure.types';

/**
 * Design and results share a row on wide screens and stack below, as do variants and
 * measures. Intrinsic rather than breakpoint-driven, so a pair reflows to its space.
 */
const PAIR_COLUMNS = 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))';

export function PageExperiment()
{
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { experimentId } = useParams<{ experimentId: string }>();
    const id = experimentId ?? null;

    const { data: experiment, isLoading, error } = useExperiment( id );

    // One query per area, so a slow or missing endpoint cannot block the page.
    const { data: variants = [] } = useExperimentVariantsByExperiment( id );
    const { data: measures = [] } = useExperimentMeasuresByExperiment( id );
    const { data: learnings = [] } = useLearningsByExperiment( id );
    const { data: sources = [] } = useMeasurementSources();
    const { data: metrics = [] } = useMetrics();
    const { data: formulas = [] } = useFormulas();

    const [groupBy, setGroupBy] = useState<ResultGrouping>( 'day' );
    const results = useExperimentResults( id, groupBy );

    const start = useStartExperiment();
    const abandon = useAbandonExperiment();
    const deleteVariant = useDeleteExperimentVariant();
    const deleteMeasure = useDeleteExperimentMeasure();

    const [editingDesign, setEditingDesign] = useState( false );
    const [concluding, setConcluding] = useState( false );
    const [confirmingAbandon, setConfirmingAbandon] = useState( false );
    const [confirmingDelete, setConfirmingDelete] = useState( false );
    const [variantDialog, setVariantDialog] = useState<{ variant: ExperimentVariant | null } | null>( null );
    const [measureDialog, setMeasureDialog] = useState<{ measure: ExperimentMeasure | null } | null>( null );

    const phase = experiment ? experimentPhase( experiment ) : undefined;
    const isDraft = phase === 'draft';

    // The newest lifecycle or child-delete failure, shown above the sections.
    const actionError = start.error ?? abandon.error ?? deleteVariant.error ?? deleteMeasure.error;

    const isPending = start.isPending || abandon.isPending;

    /** Results change whenever the experiment's shape does, so they are re-read after each lifecycle move. */
    const refetchResults = results.refetch;

    const handleStart = async () =>
    {
        if( !experiment ) return;
        await start.mutateAsync( experiment.id ).catch( () => undefined );
        refetchResults();
    };

    const handleAbandon = async () =>
    {
        if( !experiment ) return;
        setConfirmingAbandon( false );
        await abandon.mutateAsync( experiment.id ).catch( () => undefined );
        refetchResults();
    };

    const deleteVariantRecord = ( variant: ExperimentVariant ) =>
        deleteVariant.mutateAsync( variant.id ).then( refetchResults ).catch( () => undefined );

    const deleteMeasureRecord = ( measure: ExperimentMeasure ) =>
        deleteMeasure.mutateAsync( measure.id ).then( refetchResults ).catch( () => undefined );

    const title = experiment?.title ?? t( 'pages.experiment.title' );

    const closeVariantDialog = () =>
    {
        setVariantDialog( null );
        refetchResults();
    };

    const closeMeasureDialog = () =>
    {
        setMeasureDialog( null );
        refetchResults();
    };

    return (
        <Page title={title} description={t( 'pages.experiment.description' )}>
            {/* Static: the top bar says where you are, the header below says which
                experiment this is. Both showing the title is a duplicate. */}
            <NavbarLayout title={t( 'pages.experiment.overview' )}>

                {error && (
                    <Typography role="alert" color="error" sx={{ mb: 2 }}>
                        {formatApiError( t, error )}
                    </Typography>
                )}

                {isLoading && !error && <Skeleton variant="rectangular" height={112} sx={{ borderRadius: 1 }} />}

                {!isLoading && !error && !experiment && (
                    <EmptyState
                        icon="flask"
                        headline={t( 'pages.experiment.notFound' )}
                        subtext={t( 'pages.experiment.notFoundSubtext' )}
                        actions={[
                            {
                                label: t( 'pages.experiment.backToCollection' ),
                                variant: 'contained',
                                onClick: () => navigate( '/experiments' ),
                            },
                        ]}
                    />
                )}

                {experiment && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <ExperimentProfileHeader
                            experiment={experiment}
                            isPending={isPending}
                            onEdit={() => setEditingDesign( true )}
                            onStart={handleStart}
                            onConclude={() => setConcluding( true )}
                            onAbandon={() => setConfirmingAbandon( true )}
                            onDelete={() => setConfirmingDelete( true )}
                        />

                        {actionError && (
                            <Typography role="alert" color="error">
                                {formatApiError( t, actionError )}
                            </Typography>
                        )}

                        <Box sx={{ display: 'grid', gridTemplateColumns: PAIR_COLUMNS, gap: 3, alignItems: 'start' }}>
                            <ExperimentDesignSection experiment={experiment} />
                            <ExperimentResultsSection
                                results={results.data}
                                isLoading={results.isLoading}
                                error={results.error}
                                groupBy={groupBy}
                                onGroupByChange={setGroupBy}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: PAIR_COLUMNS, gap: 3, alignItems: 'start' }}>
                            <ExperimentVariantsSection
                                variants={variants}
                                sources={sources}
                                editable={isDraft}
                                onAdd={() => setVariantDialog( { variant: null } )}
                                onEdit={variant => setVariantDialog( { variant } )}
                                onDelete={deleteVariantRecord}
                            />
                            <ExperimentMeasuresSection
                                measures={measures}
                                metrics={metrics}
                                formulas={formulas}
                                editable={isDraft}
                                onAdd={() => setMeasureDialog( { measure: null } )}
                                onEdit={measure => setMeasureDialog( { measure } )}
                                onDelete={deleteMeasureRecord}
                            />
                        </Box>

                        <ExperimentLearningsSection learnings={learnings} />

                    </Box>
                )}

                <ExperimentDialog
                    open={editingDesign}
                    experiment={experiment ?? null}
                    onClose={() => { setEditingDesign( false ); refetchResults(); }}
                />

                <ConcludeExperimentDialog
                    open={concluding}
                    experiment={experiment ?? null}
                    onClose={() => setConcluding( false )}
                    onConcluded={refetchResults}
                />

                {experiment && (
                    <>
                        <ExperimentVariantDialog
                            open={variantDialog != null}
                            experimentId={experiment.id}
                            variant={variantDialog?.variant ?? null}
                            onClose={closeVariantDialog}
                        />

                        <ExperimentMeasureDialog
                            open={measureDialog != null}
                            experimentId={experiment.id}
                            measure={measureDialog?.measure ?? null}
                            onClose={closeMeasureDialog}
                        />
                    </>
                )}

                <MessageDialog
                    open={confirmingAbandon}
                    onClose={() => setConfirmingAbandon( false )}
                    title={t( 'pages.experiment.actions.abandon' )}
                    actions={
                        <>
                            <Button onClick={() => setConfirmingAbandon( false )} variant="text">
                                {t( 'shared.buttons.cancel' )}
                            </Button>
                            <Button onClick={handleAbandon} variant="contained" color="error" disabled={abandon.isPending}>
                                {t( 'pages.experiment.actions.abandon' )}
                            </Button>
                        </>
                    }
                >
                    <Typography>{t( 'pages.experiment.actions.abandonConfirm' )}</Typography>
                </MessageDialog>

                <DeleteExperimentDialog
                    open={confirmingDelete}
                    onClose={() => setConfirmingDelete( false )}
                    experiment={experiment ?? null}
                    onDeleted={() => navigate( '/experiments' )}
                />

            </NavbarLayout>
        </Page>
    );
}

export default PageExperiment;
