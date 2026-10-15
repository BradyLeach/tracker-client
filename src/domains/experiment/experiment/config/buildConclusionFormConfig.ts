/**
 * buildConclusionFormConfig
 *
 * Form config for concluding an experiment: the decision and the learning it leaves.
 *
 * Neither field is one the experiment model accepts from a form — the decision is
 * recorded only by the conclude action, and the learning is its own record — so the
 * fields are declared here. The decision's options still come from the model. The
 * conclude action validates both, and its error key shows in the dialog's feedback.
 */

import i18n from 'i18next';
import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';

/** A learning is a paragraph, not a label. */
const LEARNING_ROWS = 4;

export function buildConclusionFormConfig(): FormConfig
{
    const decisionField = formFieldFactory.getFormFields( 'experiment' ).find( field => field.name === 'decision' );

    const decision: FormFieldConfig = {
        name: 'decision',
        type: 'select',
        required: true,
        options: ( decisionField?.options ?? [] ).map( option => ( {
            value: option.value,
            label: i18n.t( `forms.conclusion.options.${option.value}` ),
        } ) ),
    };

    const learning: FormFieldConfig = {
        name: 'learning',
        type: 'text',
        required: true,
        props: { multiline: true, minRows: LEARNING_ROWS },
    };

    return {
        context: {
            isCreate: true,
            service: 'conclusion',
            operation: 'create',
        },
        groups: [{ type: 'fields' as const, fields: [decision, learning] }],
    };
}
