/**
 * Experiment Measure Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

export type MeasureType = 'metric' | 'formula' | 'calculator';

export interface ExperimentMeasure
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    experimentId: string;
    label?: string;
    measureType: MeasureType;
    /** Metric measures only. */
    metricId?: string;
    /** Formula measures only. */
    formulaId?: string;
    /** Calculator measures only: the calculator registry key. */
    calculatorKey?: string;
    /** Calculator measures only: the metric bound to each calculator input. */
    calculatorInputs?: Record<string, string>;
    /** Exactly one per experiment. */
    isPrimary: boolean;
    createdAt?: string;
    updatedAt?: string;
}
