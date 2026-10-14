/**
 * buildCreatePartnershipFormConfig
 *
 * Builds the form configuration for the Create Partnership dialog.
 *
 * Field order:
 * 1. partnershipTypeId — constrained autocomplete (catalog from type registry)
 * 2. contactName  — text
 * 3. contactEmail — email
 * 4. contactPhone — text
 * 5. rating       — number (1–5)
 *
 * Partnership fields only. companyId is supplied by the caller — an existing company, or
 * one the dialog creates first from the company domain's own form config.
 *
 * partnershipTypeId is a plain uuid field on the model, so it is overridden to a
 * constrained autocomplete whose options come from the type registry. Option
 * values are type IDs; option labels are translated from the type's label.
 */

import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import { typeRegistry } from '@/core/models/TypeRegistry';
import i18n from 'i18next';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { AutocompleteOption } from '@/components/ui';

const PARTNERSHIP_FORM_FIELDS = ['partnershipTypeId', 'contactName', 'contactEmail', 'contactPhone', 'rating'];

/**
 * Builds the partnership form configuration for both create and edit.
 *
 * @param defaults - Optional existing values to pre-populate fields (edit mode).
 * @returns FormConfig ready to pass to BaseFormRenderer.
 */
export function buildCreatePartnershipFormConfig( defaults?: Record<string, unknown> ): FormConfig
{
    const allPartnershipFields = formFieldFactory.getFormFields( 'partnership' );

    const partnershipByKey = Object.fromEntries( allPartnershipFields.map( f => [f.name, f] ) );

    const validation = modelRegistry.getValidation( 'partnership' ).pick( PARTNERSHIP_FORM_FIELDS );

    const d = defaults ?? {};

    const partnershipTypeOptions: AutocompleteOption[] = typeRegistry
        .getByModel( 'partnershipType' )
        .map( type => ( { value: type.id, label: i18n.t( `types.partnershipType.${type.label}` ), icon: type.icon } ) );

    const partnershipTypeField: FormFieldConfig | undefined = partnershipByKey['partnershipTypeId']
        ? {
            ...partnershipByKey['partnershipTypeId'],
            type: 'autocomplete',
            freeSolo: false,
            options: partnershipTypeOptions,
            defaultValue: d['partnershipTypeId'],
        }
        : undefined;

    const fields: FormFieldConfig[] = [
        partnershipTypeField,
        partnershipByKey['contactName'] ? { ...partnershipByKey['contactName'], defaultValue: d['contactName'] } : undefined,
        partnershipByKey['contactEmail'] ? { ...partnershipByKey['contactEmail'], defaultValue: d['contactEmail'] } : undefined,
        partnershipByKey['contactPhone'] ? { ...partnershipByKey['contactPhone'], defaultValue: d['contactPhone'] } : undefined,
        partnershipByKey['rating'] ? {
            ...partnershipByKey['rating'],
            defaultValue: d['rating'],
            type: 'rating' as const
        } : undefined,
    ].filter( ( f ): f is FormFieldConfig => !!f );

    return {
        context: { isCreate: true, service: 'partnership', operation: 'create' },
        validationSchema: validation,
        groups: [
            {
                type: 'fields' as const,
                fields,
            },
        ],
    };
}
