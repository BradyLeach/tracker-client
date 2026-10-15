/**
 * calculators.orchestrator
 *
 * Supplies what the calculator library config cannot express on its own — the translated
 * name and category, and the text search reads for them — and presents a run's result in
 * the units the registry describes.
 *
 * Kept out of buildCalculatorsTableConfig so that file stays declarative and JSX-free,
 * matching the companies orchestrator.
 *
 * @example
 * ```tsx
 * const config = withCalculatorCellRenderers( buildCalculatorsTableConfig() );
 * ```
 */

import i18n from 'i18next';
import { formatScaledValue } from '../utils/formatScaledValue';
import type { TableConfig } from '@/components/tables';
import type {
    CalculatorDescriptor, CalculatorField, CalculatorOutput, CalculatorRunResult, CalculatorValueShape,
} from '../types/calculator.types';

export function calculatorName( descriptor: CalculatorDescriptor ): string
{
    return i18n.t( `calculators.names.${descriptor.key}` );
}

export function calculatorCategory( descriptor: CalculatorDescriptor ): string
{
    return i18n.t( `calculators.categories.${descriptor.category}` );
}

export function withCalculatorCellRenderers( config: TableConfig<CalculatorDescriptor> ): TableConfig<CalculatorDescriptor>
{
    return {
        ...config,
        columns: config.columns.map( column =>
        {
            if( column.key === 'key' ) return { ...column, render: calculatorName, searchValue: calculatorName };
            if( column.key === 'category' ) return { ...column, render: calculatorCategory, searchValue: calculatorCategory };
            return column;
        } ),
    };
}

/** One labelled line of a result. */
export interface ResultLine
{
    label?: string;
    value: string;
}

function isFieldOutput( output: CalculatorOutput ): output is { fields: CalculatorField[] }
{
    return 'fields' in output;
}

function formatValue( value: unknown, shape: CalculatorValueShape, unknown: string ): string
{
    if( value === undefined || value === null ) return unknown;
    if( shape.unit === 'boolean' ) return i18n.t( value ? 'calculators.options.yes' : 'calculators.options.no' );
    if( shape.unit === 'enum' ) return i18n.t( `calculators.options.${String( value )}` );
    return typeof value === 'number' ? formatScaledValue( value, shape.unit, shape.scale, unknown ) : String( value );
}

/**
 * A run's result as lines to show: one for a scalar output, one per field for an object
 * output. An absent result — a zero denominator — reads as unknowable, never as zero.
 */
export function describeResult( descriptor: CalculatorDescriptor, run: CalculatorRunResult ): ResultLine[]
{
    const unknown = i18n.t( 'pages.calculators.unknown' );
    const { output } = descriptor;

    if( isFieldOutput( output ) )
    {
        const fields = typeof run.result === 'object' && run.result !== null ? run.result : {};

        return output.fields.map( field => ( {
            label: i18n.t( `calculators.inputs.${field.key}` ),
            value: formatValue( ( fields as Record<string, unknown> )[field.key], field, unknown ),
        } ) );
    }

    return [{ value: formatValue( run.result, output, unknown ) }];
}
