/**
 * Experiment Sub-Domain — Public API
 *
 * Stable import surface for the experiment sub-domain.
 * Import from here, never from internal paths.
 */

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
} from './types/experiment.types';
export { experimentService } from './services/experiment.service';
export { useExperiments } from './hooks/useExperiments';
export { useExperiment } from './hooks/useExperiment';
export { useCreateExperiment } from './hooks/useCreateExperiment';
export { useUpdateExperiment } from './hooks/useUpdateExperiment';
export { useDeleteExperiment } from './hooks/useDeleteExperiment';
export { useStartExperiment } from './hooks/useStartExperiment';
export { useAbandonExperiment } from './hooks/useAbandonExperiment';
export { useConcludeExperiment } from './hooks/useConcludeExperiment';
export { useExperimentResults } from './hooks/useExperimentResults';
export { buildExperimentsTableConfig } from './config/buildExperimentsTableConfig';
export { buildExperimentFormConfig } from './config/buildExperimentFormConfig';
export { withExperimentCellRenderers } from './orchestrators/experiments.orchestrator';
export { ExperimentDialog } from './components/ExperimentDialog';
export type { ExperimentDialogProps } from './components/ExperimentDialog';
export { DeleteExperimentDialog } from './components/DeleteExperimentDialog';
export type { DeleteExperimentDialogProps } from './components/DeleteExperimentDialog';
