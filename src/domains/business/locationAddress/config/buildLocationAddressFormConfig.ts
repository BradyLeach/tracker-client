/**
 * buildLocationAddressFormConfig
 *
 * Form config for the relationship fields of a location address — the address type only.
 * locationId and addressId are supplied by the caller, never entered.
 *
 * addressTypeId is overridden to a constrained autocomplete whose options come from the
 * type registry, same pattern as locationTypeId.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { typeRegistry } from '@/core/models/TypeRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { AutocompleteOption } from '@/components/ui';
import type { LocationAddress } from '../types/locationAddress.types';

const LOCATION_ADDRESS_FORM_FIELDS = ['addressTypeId'];

export function buildLocationAddressFormConfig( defaults?: Partial<LocationAddress> ): FormConfig
{
    const allFields = formFieldFactory.getFormFields( 'locationAddress' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'locationAddress' ).pick( LOCATION_ADDRESS_FORM_FIELDS );

    const presetValues: Partial<LocationAddress> = defaults ?? {};

    const addressTypeOptions: AutocompleteOption[] = typeRegistry
        .getByModel( 'addressType' )
        .map( type => ( { value: type.id, label: i18n.t( `types.addressType.${type.label}` ), icon: type.icon } ) );

    const fields: FormFieldConfig[] = LOCATION_ADDRESS_FORM_FIELDS
        .map( key =>
        {
            const base = byKey[key];
            if( !base ) return undefined;

            const field: FormFieldConfig = { ...base, defaultValue: presetValues[key as keyof LocationAddress] };

            if( key === 'addressTypeId' )
            {
                return {
                    ...field,
                    type: 'autocomplete',
                    freeSolo: false,
                    options: addressTypeOptions,
                } as FormFieldConfig;
            }

            return field;
        } )
        .filter( ( field ): field is FormFieldConfig => !!field );

    return {
        context: { service: 'locationAddress', operation: defaults?.id ? 'update' : 'create' },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}
