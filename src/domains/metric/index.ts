/**
 * Metric Domain — Public API
 *
 * Stable import surface for all metric sub-domains.
 * Import from here, never from internal paths.
 */

// Metric
export type {
    Metric,
    MetricAggregation,
    ResultGrouping,
    DimensionFilter,
    TrendPoint,
    MetricValues
} from './metric';
export {
    metricService,
    useMetrics,
    useMetric,
    useCreateMetric,
    useUpdateMetric,
    useDeleteMetric,
    useMetricValues
} from './metric';

// Formula
export type {
    Formula,
    FormulaOutputUnit
} from './formula';
export {
    formulaService,
    useFormulas,
    useFormula,
    useCreateFormula,
    useUpdateFormula,
    useDeleteFormula
} from './formula';
