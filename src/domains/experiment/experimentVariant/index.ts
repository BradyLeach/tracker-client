/**
 * Experiment Variant Sub-Domain — Public API
 *
 * Stable import surface for the experiment variant sub-domain.
 * Import from here, never from internal paths.
 */

export type { ExperimentVariant, AttributionEntry } from './types/experimentVariant.types';
export { experimentVariantService } from './services/experimentVariant.service';
export { useExperimentVariants } from './hooks/useExperimentVariants';
export { useExperimentVariant } from './hooks/useExperimentVariant';
export { useCreateExperimentVariant } from './hooks/useCreateExperimentVariant';
export { useUpdateExperimentVariant } from './hooks/useUpdateExperimentVariant';
export { useDeleteExperimentVariant } from './hooks/useDeleteExperimentVariant';
export { useExperimentVariantsByExperiment } from './hooks/useExperimentVariantsByExperiment';
