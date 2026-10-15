/**
 * buildMeasurementSourceFormConfig
 *
 * Form config for creating or editing a measurement source. Pass defaults to pre-populate
 * fields from an existing source; without an id the config is for create.
 *
 * The key, what the source delivers and its bucket size are fixed once created, so an
 * edit form keeps only the label and the allowed sets. The allowed sets are lists of
 * free-text names — what a source may write is the account's to decide.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { MeasurementSource } from '../types/measurementSource.types';

const CREATE_FIELDS = ['key', 'label', 'sourceType', 'bucketSize', 'allowedMeasurementNames', 'allowedDimensionKeys'];
const UPDATE_FIELDS = ['label', 'allowedMeasurementNames', 'allowedDimensionKeys'];

const TRANSLATED_ENUMS = ['sourceType', 'bucketSize'];

export function buildMeasurementSourceFormConfig( defaults?: Partial<MeasurementSource> ): FormConfig
{
    const formFields = defaults?.id ? UPDATE_FIELDS : CREATE_FIELDS;

    const allFields = formFieldFactory.getFormFields( 'measurementSource' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'measurementSource' ).pick( formFields );

    const presetValues: Partial<MeasurementSource> = defaults ?? {};

    const fields: FormFieldConfig[] = formFields
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof MeasurementSource] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined )
        .map( field => TRANSLATED_ENUMS.includes( field.name ) ? withTranslatedOptions( field ) : field );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'measurementSource',
            operation: defaults?.id ? 'update' : 'create',
        },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}

/** Enum options arrive as their raw values; the translation happens here, where the form is assembled. */
function withTranslatedOptions( field: FormFieldConfig ): FormFieldConfig
{
    if( !field.options ) return field;

    return {
        ...field,
        options: field.options.map( option => ( {
            value: option.value,
            label: i18n.t( `forms.measurementSource.options.${option.value}` ),
        } ) ),
    };
}
