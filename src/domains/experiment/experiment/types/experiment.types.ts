/**
 * Experiment Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

import type { TrendPoint } from '@/domains/metric';
import type { StateGraphState } from '@/domains/state';

export type ThresholdDirection = 'atLeast' | 'atMost';

export type ExperimentDecision = 'persevere' | 'pivot' | 'kill';

export type ThresholdStatus = 'pass' | 'fail' | 'inconclusive';

export interface Experiment
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    title: string;
    /** The falsifiable hypothesis being tested. Locked once running. */
    hypothesis: string;
    /** Whole number in the primary measure's unit and scale. Locked once running. */
    thresholdValue?: number;
    thresholdDirection?: ThresholdDirection;
    /** UTC window. Locked once running. */
    windowStart?: string;
    windowEnd?: string;
    /** Recorded only by concluding. */
    decision?: ExperimentDecision;
    concludedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    /** State graph foreign keys — managed by the backend state engine. */
    stateGraphId?: string;
    currentStateGraphStateId?: string;
    previousStateGraphStateId?: string;
    enteredCurrentStateAt?: string;
    /** Hydrated current state — present when the currentStateGraphState include is requested. */
    currentStateGraphState?: StateGraphState;
}

/** Endpoint: POST experiment/experiments/conclude */
export interface ConclusionPayload
{
    id: string;
    decision: ExperimentDecision;
    learning: string;
}

/** A measure's or metric's trend, keyed by grouping. */
export type GroupedTrends = Partial<Record<'day' | 'week' | 'month', TrendPoint[]>>;

export interface MetricResult
{
    metricId: string;
    key: string;
    value?: number;
    trends: GroupedTrends;
}

export interface MeasureResult
{
    measureId: string;
    measureType: 'metric' | 'formula' | 'calculator';
    label?: string;
    isPrimary: boolean;
    /** A number, a calculator's object result, or absent when it cannot be known. */
    value?: number | Record<string, unknown>;
    /** Error key when the measure could not be evaluated. */
    errorKey?: string;
    trends: GroupedTrends;
}

export interface PrimaryAssessment
{
    value?: number;
    /** Relative change over control at RATIO_SCALE. Absent for the control. */
    lift?: number;
    significance?: { zScore: number; pValue: number; significant: boolean };
    thresholdStatus?: ThresholdStatus;
}

export interface VariantResult
{
    variantId: string;
    label: string;
    isControl: boolean;
    metrics: MetricResult[];
    measures: MeasureResult[];
    primary: PrimaryAssessment;
}

/** Endpoint: POST experiment/experiments/results */
export interface ExperimentResults
{
    experimentId: string;
    computedAt: string;
    timeZone: string;
    window: { start?: string; end?: string };
    threshold: { value?: number; direction?: ThresholdDirection };
    primaryMeasureId?: string;
    variants: VariantResult[];
    /** True when answered from the snapshot frozen at conclusion. */
    frozen: boolean;
    frozenAt?: string;
}
