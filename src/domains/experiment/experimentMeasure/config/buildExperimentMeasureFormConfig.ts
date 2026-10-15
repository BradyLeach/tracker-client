/**
 * buildExperimentMeasureFormConfig
 *
 * Form config for a measure of one type. The type, and for a calculator measure the
 * calculator, are chosen before the form; this builds the fields that choice needs:
 *
 *   metric      the metric to measure
 *   formula     the formula to measure
 *   calculator  one metric per bindable calculator input, from the registry descriptor
 *
 * then the label and the primary flag. Options are passed in, so the builder stays pure
 * data and a playground can call it with mock metrics and a mock descriptor.
 *
 * Calculator inputs are named `calculatorInputs.<inputKey>`, so the submitted values
 * arrive as the `calculatorInputs` object the server stores. Enum and boolean inputs are
 * choices, not measurements, and are never offered for binding.
 */

import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { CalculatorDescriptor, CalculatorUnit } from '@/domains/calculator';
import type { Formula, Metric } from '@/domains/metric';
import type { ExperimentMeasure, MeasureType } from '../types/experimentMeasure.types';

/** Input units a metric value can never fill. Matches the server's own rule. */
const UNBINDABLE_UNITS: readonly CalculatorUnit[] = ['enum', 'boolean'];

const SHARED_FIELDS = ['label', 'isPrimary'];

export interface ExperimentMeasureFormOptions
{
    measureType: MeasureType;
    metrics: readonly Metric[];
    formulas: readonly Formula[];
    /** The chosen calculator's descriptor; calculator measures only. */
    calculator?: CalculatorDescriptor;
    defaults?: Partial<ExperimentMeasure>;
}

/** A metric or formula offered by its label, falling back to the key formulas use. */
function optionOf( record: { id: string; key: string; label?: string } )
{
    return { value: record.id, label: record.label ? `${record.label} (${record.key})` : record.key };
}

export function buildExperimentMeasureFormConfig( {
    measureType,
    metrics,
    formulas,
    calculator,
    defaults,
}: ExperimentMeasureFormOptions ): FormConfig
{
    const allFields = formFieldFactory.getFormFields( 'experimentMeasure' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );

    const targetFields: FormFieldConfig[] = [];

    if( measureType === 'metric' )
    {
        targetFields.push( {
            name: 'metricId', type: 'select', required: true,
            options: metrics.map( optionOf ), defaultValue: defaults?.metricId,
        } );
    }

    if( measureType === 'formula' )
    {
        targetFields.push( {
            name: 'formulaId', type: 'select', required: true,
            options: formulas.map( optionOf ), defaultValue: defaults?.formulaId,
        } );
    }

    if( measureType === 'calculator' && calculator )
    {
        for( const input of calculator.inputs )
        {
            if( UNBINDABLE_UNITS.includes( input.unit ) ) continue;

            targetFields.push( {
                name: `calculatorInputs.${input.key}`,
                type: 'select',
                required: !input.optional,
                virtual: true,
                label: { text: `calculators.inputs.${input.key}` },
                placeholder: 'forms.experimentMeasure.fields.metricIdPlaceholder',
                options: metrics.map( optionOf ),
                defaultValue: defaults?.calculatorInputs?.[input.key],
            } );
        }
    }

    const sharedFields: FormFieldConfig[] = SHARED_FIELDS
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: defaults?.[key as keyof ExperimentMeasure] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined );

    const validatedKeys = [...SHARED_FIELDS, ...targetFields.filter( field => !field.virtual ).map( field => field.name )];

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'experimentMeasure',
            operation: defaults?.id ? 'update' : 'create',
        },
        validationSchema: modelRegistry.getValidation( 'experimentMeasure' ).pick( validatedKeys ),
        groups: [{ type: 'fields' as const, fields: [...targetFields, ...sharedFields] }],
    };
}
