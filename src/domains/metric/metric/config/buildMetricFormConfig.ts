/**
 * buildMetricFormConfig
 *
 * Form config for a metric over one measurement source. The source is chosen before the
 * form, because what can be measured depends on it: the measurement names and the
 * dimension keys offered here are that source's allowed sets, never typed lists.
 *
 * Pass defaults to pre-populate fields from an existing metric; without an id the config
 * is for create. The key is fixed once created, so an edit form leaves it out.
 *
 * Fields, validation and enum options come from the model definition; the source's allowed
 * sets replace the free-text inputs the model alone would give.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { MeasurementSource } from '@/domains/measurement';
import type { Metric } from '../types/metric.types';

const CREATE_FIELDS = ['key', 'label', 'measurementName', 'aggregation', 'uniqueDimensionKey', 'windowDays'];
const UPDATE_FIELDS = CREATE_FIELDS.filter( key => key !== 'key' );

export function buildMetricFormConfig( source: MeasurementSource, defaults?: Partial<Metric> ): FormConfig
{
    const formFields = defaults?.id ? UPDATE_FIELDS : CREATE_FIELDS;

    const allFields = formFieldFactory.getFormFields( 'metric' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'metric' ).pick( formFields );

    const presetValues: Partial<Metric> = defaults ?? {};

    const fields: FormFieldConfig[] = formFields
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof Metric] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined )
        .map( field =>
        {
            if( field.name === 'measurementName' ) return asChoiceOf( field, source.allowedMeasurementNames, true );
            if( field.name === 'uniqueDimensionKey' ) return asChoiceOf( field, source.allowedDimensionKeys, false );
            if( field.name === 'aggregation' ) return withTranslatedOptions( field );
            return field;
        } );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'metric',
            operation: defaults?.id ? 'update' : 'create',
        },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}

/** A free-text field narrowed to the values the source allows. */
function asChoiceOf( field: FormFieldConfig, values: readonly string[], required: boolean ): FormFieldConfig
{
    return { ...field, type: 'select', required, options: values.map( value => ( { value, label: value } ) ) };
}

/** Enum options arrive as their raw values; the translation happens here, where the form is assembled. */
function withTranslatedOptions( field: FormFieldConfig ): FormFieldConfig
{
    if( !field.options ) return field;

    return {
        ...field,
        options: field.options.map( option => ( {
            value: option.value,
            label: i18n.t( `forms.metric.options.${option.value}` ),
        } ) ),
    };
}
