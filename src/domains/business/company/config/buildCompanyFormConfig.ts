/**
 * buildCompanyFormConfig
 *
 * Form config for creating, viewing or editing a company record.
 * Pass defaults to pre-populate fields from an existing company; without an id the
 * config is for create.
 *
 * Fields, validation and enum options all come from the model definition — passing the
 * record is enough to populate it.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { IconKey } from '@/components/ui';
import type { Company } from '../types/company.types';

/**
 * Every editable field on the company, in the order they are shown.
 *
 * Contact email and phone are deliberately absent: they belong to a partnership, which is a
 * relationship with a person at the company, not a property of the company itself.
 */
const COMPANY_FORM_FIELDS = ['name', 'icon', 'websiteUrl', 'taxIdentifierType', 'taxIdentifier'];

export function buildCompanyFormConfig( defaults?: Partial<Company> ): FormConfig
{
    const allFields = formFieldFactory.getFormFields( 'company' );
    const byKey = Object.fromEntries( allFields.map( f => [f.name, f] ) );
    const validation = modelRegistry.getValidation( 'company' ).pick( COMPANY_FORM_FIELDS );

    const presetValues: Partial<Company> = defaults ?? {};

    const fields: FormFieldConfig[] = COMPANY_FORM_FIELDS
        .map( key => byKey[key] ? { ...byKey[key], defaultValue: presetValues[key as keyof Company] } as FormFieldConfig : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined )
        .map( field => field.name === 'taxIdentifierType' ? withTranslatedOptions( field ) : field )
        .map( field => field.name === 'icon' ? asIconField( field ) : field );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'company',
            operation: defaults?.id ? 'update' : 'create',
        },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}

/**
 * A company's icon is stored as text; the form offers it through the icon picker, with a
 * building standing in until one is chosen — the same fallback the companies table uses.
 */
function asIconField( field: FormFieldConfig ): FormFieldConfig
{
    return { ...field, type: 'icon', props: { ...field.props, fallback: 'building' satisfies IconKey } };
}

/**
 * Enum options arrive from the model as their raw values — 'abn', 'gst'. The factory has no
 * way to know what they should read as, so the translation happens here, where the form is
 * assembled, rather than in the field component.
 */
function withTranslatedOptions( field: FormFieldConfig ): FormFieldConfig
{
    if( !field.options ) return field;

    return {
        ...field,
        options: field.options.map( option => ( {
            value: option.value,
            label: i18n.t( `forms.company.options.${option.value}` ),
        } ) ),
    };
}
