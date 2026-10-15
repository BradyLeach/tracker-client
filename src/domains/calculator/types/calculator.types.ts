/**
 * Calculator Types
 *
 * The calculator registry as the server describes it. Forms for standalone calculators
 * and for binding an experiment's calculator measures to metrics are built from these
 * descriptors; the client hardcodes no calculator or input list.
 */

export type CalculatorUnit =
    'number' | 'count' | 'money' | 'rate' | 'multiple' | 'days' | 'statistic' | 'boolean' | 'enum';

/** How one input or output value is expressed. Rates, multiples and statistics carry their integer scale. */
export interface CalculatorValueShape
{
    unit: CalculatorUnit;
    scale?: number;
    options?: string[];
}

export interface CalculatorInput extends CalculatorValueShape
{
    key: string;
    optional?: boolean;
    default?: unknown;
}

export interface CalculatorField extends CalculatorValueShape
{
    key: string;
}

/** A scalar output, or an object output described field by field. */
export type CalculatorOutput = CalculatorValueShape | { fields: CalculatorField[] };

/** Endpoint: GET system/calculators */
export interface CalculatorDescriptor
{
    key: string;
    category: string;
    inputs: CalculatorInput[];
    output: CalculatorOutput;
}

/** Endpoint: POST system/calculators/run */
export interface CalculatorRunPayload
{
    key: string;
    values: Record<string, unknown>;
}

/** `result` is absent when a denominator is zero: the value cannot be known. */
export interface CalculatorRunResult
{
    key: string;
    result?: number | string | Record<string, unknown>;
}
