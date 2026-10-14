/**
 * buildLocationFormConfig
 *
 * Form config for creating/editing a location record.
 *
 * Fields, validation and type options all come from the model definition and the type
 * registry — the form config assembles them, never invents them.
 *
 * companyId is a visible autocomplete field — the dialog loads company options and
 * passes them in, same relationship pattern as partnership.
 *
 * locationTypeId is overridden to a constrained autocomplete whose options come from the
 * type registry, same pattern as partnershipTypeId.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { typeRegistry } from '@/core/models/TypeRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { AutocompleteOption } from '@/components/ui';
import type { Location } from '../types/location.types';

const LOCATION_FORM_FIELDS = ['companyId', 'label', 'locationTypeId', 'description'];

export function buildLocationFormConfig(
    companyOptions: AutocompleteOption[],
    defaults?: Partial<Location>,
): FormConfig
{
    const allFields = formFieldFactory.getFormFields( 'location' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'location' ).pick( LOCATION_FORM_FIELDS );

    const presetValues: Partial<Location> = defaults ?? {};

    const locationTypeOptions: AutocompleteOption[] = typeRegistry
        .getByModel( 'locationType' )
        .map( type => ( { value: type.id, label: i18n.t( `types.locationType.${type.label}` ), icon: type.icon } ) );

    const fields: FormFieldConfig[] = LOCATION_FORM_FIELDS
        .map( key =>
        {
            const base = byKey[key];
            if( !base ) return undefined;

            const field: FormFieldConfig = { ...base, defaultValue: presetValues[key as keyof Location] };

            if( key === 'companyId' )
            {
                return {
                    ...field,
                    type: 'autocomplete',
                    freeSolo: false,
                    options: companyOptions,
                } as FormFieldConfig;
            }

            if( key === 'locationTypeId' )
            {
                return {
                    ...field,
                    type: 'autocomplete',
                    freeSolo: false,
                    options: locationTypeOptions,
                } as FormFieldConfig;
            }

            return field;
        } )
        .filter( ( field ): field is FormFieldConfig => !!field );

    return {
        context: { service: 'location', operation: defaults?.id ? 'update' : 'create' },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}
