/**
 * Formula Types
 *
 * Normalized — stores IDs only, never redefines reference shapes.
 * Hydration of related entities is the hook/controller's responsibility.
 */

/** The unit a formula's result is expressed in, which sets the scale it is rounded at. */
export type FormulaOutputUnit = 'count' | 'money' | 'rate' | 'multiple';

export interface Formula
{
    /** Primary key — read only. */
    id: string;
    ownerId: string;
    /** Fixed once created. */
    key: string;
    label?: string;
    /** Numbers, metric keys, + - * /, parentheses, min, max, abs. */
    expression: string;
    outputUnit: FormulaOutputUnit;
    createdAt?: string;
    updatedAt?: string;
}
