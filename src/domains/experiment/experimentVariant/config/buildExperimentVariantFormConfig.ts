/**
 * buildExperimentVariantFormConfig
 *
 * Form config for adding a variant to an experiment or editing one.
 * Pass defaults to pre-populate fields from an existing variant; without an id the
 * config is for create.
 *
 * Fields and validation come from the model definition. Attribution is absent: it is a
 * list of per-source filters, edited beside the form by the attribution editor rather
 * than as a field.
 */

import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { ExperimentVariant } from '../types/experimentVariant.types';

const VARIANT_FORM_FIELDS = ['label', 'isControl'];

export function buildExperimentVariantFormConfig( defaults?: Partial<ExperimentVariant> ): FormConfig
{
    const allFields = formFieldFactory.getFormFields( 'experimentVariant' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'experimentVariant' ).pick( VARIANT_FORM_FIELDS );

    const presetValues: Partial<ExperimentVariant> = defaults ?? {};

    const fields: FormFieldConfig[] = VARIANT_FORM_FIELDS
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof ExperimentVariant] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'experimentVariant',
            operation: defaults?.id ? 'update' : 'create',
        },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}
