/**
 * buildAddressFormConfig
 *
 * Form config for entering an address.
 *
 * Fields and validation come from the model definition — the form config assembles them,
 * never invents them.
 *
 * countryId is a visible autocomplete field — the caller loads country options and passes
 * them in, same relationship pattern as location's companyId.
 */

import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { AutocompleteOption } from '@/components/ui';
import type { Address } from '../types/address.types';

const ADDRESS_FORM_FIELDS = ['line1', 'line2', 'city', 'postalCode', 'countryId'];

export function buildAddressFormConfig(
    countryOptions: AutocompleteOption[],
    defaults?: Partial<Address>,
): FormConfig
{
    const allFields = formFieldFactory.getFormFields( 'address' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'address' ).pick( ADDRESS_FORM_FIELDS );

    const presetValues: Partial<Address> = defaults ?? {};

    const fields: FormFieldConfig[] = ADDRESS_FORM_FIELDS
        .map( key =>
        {
            const base = byKey[key];
            if( !base ) return undefined;

            const field: FormFieldConfig = { ...base, defaultValue: presetValues[key as keyof Address] };

            if( key === 'countryId' )
            {
                return {
                    ...field,
                    type: 'autocomplete',
                    freeSolo: false,
                    options: countryOptions,
                } as FormFieldConfig;
            }

            return field;
        } )
        .filter( ( field ): field is FormFieldConfig => !!field );

    return {
        context: { service: 'address', operation: 'create' },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}
