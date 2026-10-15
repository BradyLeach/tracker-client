/**
 * Calculator Domain — Public API
 *
 * Stable import surface for the calculator registry and standalone runs.
 * Import from here, never from internal paths.
 */

export type {
    CalculatorUnit,
    CalculatorValueShape,
    CalculatorInput,
    CalculatorField,
    CalculatorOutput,
    CalculatorDescriptor,
    CalculatorRunPayload,
    CalculatorRunResult
} from './types/calculator.types';
export { calculatorService } from './services/calculator.service';
export { useCalculators } from './hooks/useCalculators';
export { useRunCalculator } from './hooks/useRunCalculator';
