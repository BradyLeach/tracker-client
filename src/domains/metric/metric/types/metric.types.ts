/**
 * Metric Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export type MetricAggregation = 'sum' | 'count' | 'unique';

/** Calendar period trends are grouped into at read time, in the account's time zone. */
export type ResultGrouping = 'day' | 'week' | 'month';

/**
 * One dimension filter. Metrics and attribution share this language: target 'dimension'
 * matches a dimension by key, target 'campaignKey' matches the source-supplied campaign key.
 * 'equals' takes one value, 'in' one or more; a measurement must match every filter.
 */
export interface DimensionFilter
{
    target: 'dimension' | 'campaignKey';
    dimensionKey?: string;
    operator: 'equals' | 'in';
    values: string[];
}

export interface Metric
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    /** The name formulas reference this metric by. Fixed once created. */
    key: string;
    label?: string;
    measurementSourceId: string;
    measurementName: string;
    aggregation: MetricAggregation;
    /** Required for unique, absent otherwise. */
    uniqueDimensionKey?: string;
    filters: DimensionFilter[];
    /** Rolling window for standalone reads; experiments apply their own window. */
    windowDays?: number;
    createdAt?: string;
    updatedAt?: string;
}

/** One trend point. `value` is absent when it cannot be known. */
export interface TrendPoint
{
    period: string;
    value?: number;
}

/** Endpoint: POST metric/metrics/values */
export interface MetricValues
{
    metricId: string;
    from?: string;
    to: string;
    timeZone: string;
    value: number;
    trend?: TrendPoint[];
}
