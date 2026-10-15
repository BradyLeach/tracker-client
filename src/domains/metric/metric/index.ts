/**
 * Metric Sub-Domain — Public API
 *
 * Stable import surface for the metric sub-domain.
 * Import from here, never from internal paths.
 */

export type { Metric, MetricAggregation, ResultGrouping, DimensionFilter, TrendPoint, MetricValues } from './types/metric.types';
export { metricService } from './services/metric.service';
export { useMetrics } from './hooks/useMetrics';
export { useMetric } from './hooks/useMetric';
export { useCreateMetric } from './hooks/useCreateMetric';
export { useUpdateMetric } from './hooks/useUpdateMetric';
export { useDeleteMetric } from './hooks/useDeleteMetric';
export { useMetricValues } from './hooks/useMetricValues';
export { DimensionFilterEditor } from './components/DimensionFilterEditor';
export type { DimensionFilterEditorProps } from './components/DimensionFilterEditor';
