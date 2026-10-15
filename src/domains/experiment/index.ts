/**
 * Experiment Domain — Public API
 *
 * Stable import surface for all experiment sub-domains.
 * Import from here, never from internal paths.
 */

// Experiment
export type {
    Experiment,
    ThresholdDirection,
    ExperimentDecision,
    ThresholdStatus,
    ConclusionPayload,
    ExperimentResults,
    VariantResult,
    MeasureResult,
    MetricResult,
    PrimaryAssessment,
    GroupedTrends
} from './experiment';
export {
    experimentService,
    useExperiments,
    useExperiment,
    useCreateExperiment,
    useUpdateExperiment,
    useDeleteExperiment,
    useStartExperiment,
    useAbandonExperiment,
    useConcludeExperiment,
    useExperimentResults,
    ExperimentDialog,
    DeleteExperimentDialog
} from './experiment';
export type { ExperimentDialogProps, DeleteExperimentDialogProps } from './experiment';

// ExperimentVariant
export type {
    ExperimentVariant,
    AttributionEntry
} from './experimentVariant';
export {
    experimentVariantService,
    useExperimentVariants,
    useExperimentVariant,
    useCreateExperimentVariant,
    useUpdateExperimentVariant,
    useDeleteExperimentVariant,
    useExperimentVariantsByExperiment
} from './experimentVariant';

// ExperimentMeasure
export type {
    ExperimentMeasure,
    MeasureType
} from './experimentMeasure';
export {
    experimentMeasureService,
    useExperimentMeasures,
    useExperimentMeasure,
    useCreateExperimentMeasure,
    useUpdateExperimentMeasure,
    useDeleteExperimentMeasure,
    useExperimentMeasuresByExperiment
} from './experimentMeasure';

// Learning
export type {
    Learning
} from './learning';
export {
    learningService,
    useLearnings,
    useLearning,
    useCreateLearning,
    useUpdateLearning,
    useDeleteLearning,
    useLearningsByExperiment
} from './learning';

// Pages
export { PageExperiments } from './pages/PageExperiments';
