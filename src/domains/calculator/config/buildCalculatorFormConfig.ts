/**
 * buildCalculatorFormConfig
 *
 * Form config for running one calculator, built from its registry descriptor. Each input
 * becomes a field by its unit: a number for anything measured, a select for an enum and a
 * checkbox for a boolean. Optional inputs are optional fields, and an input's default
 * pre-fills it.
 *
 * Values are entered as the server takes them — whole numbers at the unit's scale — so the
 * unit's hint is the placeholder: a rate in basis points, money in minor units.
 */

import i18n from 'i18next';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { CalculatorDescriptor, CalculatorInput, CalculatorUnit } from '../types/calculator.types';

/** Units entered at a scale or in a unit worth naming; plain numbers and counts need no hint. */
const SCALED_UNITS: readonly CalculatorUnit[] = ['money', 'rate', 'multiple', 'days', 'statistic'];

function fieldOf( input: CalculatorInput ): FormFieldConfig
{
    const shared = {
        name: input.key,
        required: !input.optional,
        defaultValue: input.default,
        label: { text: `calculators.inputs.${input.key}` },
    };

    if( input.unit === 'boolean' )
    {
        return { ...shared, type: 'checkbox' };
    }

    if( input.unit === 'enum' )
    {
        return {
            ...shared,
            type: 'select',
            options: ( input.options ?? [] ).map( option => ( {
                value: option,
                label: i18n.t( `calculators.options.${option}` ),
            } ) ),
        };
    }

    return {
        ...shared,
        type: 'number',
        placeholder: SCALED_UNITS.includes( input.unit ) ? `calculators.units.${input.unit}` : undefined,
    };
}

export function buildCalculatorFormConfig( descriptor: CalculatorDescriptor ): FormConfig
{
    return {
        context: {
            isCreate: true,
            service: 'calculator',
            operation: 'create',
        },
        groups: [{ type: 'fields' as const, fields: descriptor.inputs.map( fieldOf ) }],
    };
}
