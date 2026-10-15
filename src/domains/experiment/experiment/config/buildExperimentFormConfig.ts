/**
 * buildExperimentFormConfig
 *
 * Form config for creating an experiment or editing its design.
 * Pass defaults to pre-populate fields from an existing experiment; without an id the
 * config is for create.
 *
 * Fields, validation and enum options all come from the model definition — passing the
 * record is enough to populate it.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { Experiment } from '../types/experiment.types';

/**
 * The experiment's own design, in the order it is stated: what is tested, what success
 * looks like, and when it runs.
 *
 * The primary measure and attribution are absent: they belong to the experiment's
 * measures and variants, which are added on the experiment page once it exists.
 */
const EXPERIMENT_FORM_FIELDS = ['title', 'hypothesis', 'thresholdValue', 'thresholdDirection', 'windowStart', 'windowEnd'];

/** A hypothesis is a sentence or two, not a label. */
const HYPOTHESIS_ROWS = 3;

export function buildExperimentFormConfig( defaults?: Partial<Experiment> ): FormConfig
{
    const allFields = formFieldFactory.getFormFields( 'experiment' );
    const byKey = Object.fromEntries( allFields.map( field => [field.name, field] ) );
    const validation = modelRegistry.getValidation( 'experiment' ).pick( EXPERIMENT_FORM_FIELDS );

    const presetValues: Partial<Experiment> = defaults ?? {};

    const fields: FormFieldConfig[] = EXPERIMENT_FORM_FIELDS
        .map( key => byKey[key]
            ? { ...byKey[key], defaultValue: presetValues[key as keyof Experiment] } as FormFieldConfig
            : undefined )
        .filter( ( field ): field is FormFieldConfig => field !== undefined )
        .map( field => field.name === 'thresholdDirection' ? withTranslatedOptions( field ) : field )
        .map( field => field.name === 'hypothesis' ? asProseField( field ) : field );

    return {
        context: {
            isCreate: !defaults?.id,
            service: 'experiment',
            operation: defaults?.id ? 'update' : 'create',
        },
        validationSchema: validation,
        groups: [{ type: 'fields' as const, fields }],
    };
}

function asProseField( field: FormFieldConfig ): FormFieldConfig
{
    return { ...field, props: { ...field.props, multiline: true, minRows: HYPOTHESIS_ROWS } };
}

/**
 * Enum options arrive from the model as their raw values — 'atLeast', 'atMost'. The
 * translation happens here, where the form is assembled, rather than in the field component.
 */
function withTranslatedOptions( field: FormFieldConfig ): FormFieldConfig
{
    if( !field.options ) return field;

    return {
        ...field,
        options: field.options.map( option => ( {
            value: option.value,
            label: i18n.t( `forms.experiment.options.${option.value}` ),
        } ) ),
    };
}
