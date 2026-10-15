/**
 * buildFormulaFormConfig
 *
 * Form config for creating or editing a formula. Pass defaults to pre-populate fields from
 * an existing formula; without an id the config is for create. The key is fixed once
 * created, so an edit form leaves it out.
 *
 * The expression is validated by the server, which names the position and token of any
 * mistake; its error key shows in the form's feedback slot.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { Formula } from '../types/formula.types';

const CREATE_FIELDS = ['key', 'label', 'expression', 'outputUnit'];
const UPDATE_FIELDS = CREATE_FIELDS.filter( key => key !== 'key' );

/** An expression is short, but reads better with room to wrap. */
const EXPRESSION_ROWS = 2;

export function buildFormulaFormConfig( defaults?: Partial<Formula> ): FormConfig
{
    const formFields = defaults?.id ? UPDATE_FIELDS : CREATE_FIELDS;

    const allFields = formFieldFactory.getFormFields( 'formula' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'formula' ).pick( formFields );

    const presetValues: Partial<Formula> = defaults ?? {};

    const fields: FormFieldConfig[] = formFields
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof Formula] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined )
        .map( field =>
        {
            if( field.name === 'expression' )
            {
                return { ...field, props: { ...field.props, multiline: true, minRows: EXPRESSION_ROWS } };
            }
            if( field.name === 'outputUnit' ) return withTranslatedOptions( field );
            return field;
        } );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'formula',
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
            label: i18n.t( `forms.formula.options.${option.value}` ),
        } ) ),
    };
}
