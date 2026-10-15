/**
 * buildIngestKeyFormConfig
 *
 * Form config for creating an ingest key or editing one. Pass defaults to pre-populate
 * fields from an existing key; without an id the config is for create. The key type is
 * fixed once created, so an edit form leaves it out.
 *
 * A public key may push only the events it names, and those must be events the push
 * source allows — so the push source's allowed names are offered as suggestions.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { IngestKey } from '../types/ingestKey.types';

const CREATE_FIELDS = ['label', 'keyType', 'permittedMeasurementNames'];
const UPDATE_FIELDS = ['label', 'permittedMeasurementNames'];

export function buildIngestKeyFormConfig( pushMeasurementNames: readonly string[], defaults?: Partial<IngestKey> ): FormConfig
{
    const formFields = defaults?.id ? UPDATE_FIELDS : CREATE_FIELDS;

    const allFields = formFieldFactory.getFormFields( 'ingestKey' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'ingestKey' ).pick( formFields );

    const presetValues: Partial<IngestKey> = defaults ?? {};

    const fields: FormFieldConfig[] = formFields
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof IngestKey] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined )
        .map( field =>
        {
            if( field.name === 'keyType' ) return withTranslatedOptions( field );
            if( field.name === 'permittedMeasurementNames' )
            {
                return { ...field, props: { ...field.props, suggestions: [...pushMeasurementNames] } };
            }
            return field;
        } );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'ingestKey',
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
            label: i18n.t( `forms.ingestKey.options.${option.value}` ),
        } ) ),
    };
}
