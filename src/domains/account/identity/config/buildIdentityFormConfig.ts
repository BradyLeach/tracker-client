import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig } from '@/components/forms/types/formConfig.types';

/**
 * Personal details fields — name and date of birth.
 */
const PERSONAL_FIELD_NAMES = ['firstname', 'lastname', 'dob'];

/**
 * Contact details fields — email addresses.
 */
const CONTACT_FIELD_NAMES = ['email', 'recoveryEmail'];

/**
 * All identity form field names combined — used for validation schema.
 */
const IDENTITY_FIELD_NAMES = [...PERSONAL_FIELD_NAMES, ...CONTACT_FIELD_NAMES];

/**
 * Fields that become disabled when identity is verified.
 */
const VERIFIED_LOCKED_FIELDS = ['firstname', 'lastname', 'dob'];

/**
 * Applies verified-locked and dob formatting rules to raw identity fields.
 */
function applyFieldRules( fieldNames: string[], isVerified: boolean )
{
    return formFieldFactory.getFormFields( 'identity' )
        .filter( f => fieldNames.includes( f.name ) )
        .map( f =>
        {
            if( f.name === 'dob' )
            {
                return {
                    ...f,
                    props: {
                        ...f.props,
                        outputFormat: 'date-only',
                        ...( isVerified && { disabled: true } ),
                    },
                };
            }

            if( isVerified && VERIFIED_LOCKED_FIELDS.includes( f.name ) )
            {
                return { ...f, props: { ...f.props, disabled: true } };
            }

            return f;
        } );
}

/**
 * Builds the configuration for the full identity edit form (personal + contact).
 *
 * @param isVerified - Whether the identity has been verified
 * @returns FormConfig for the identity form
 */
export function buildIdentityFormConfig( isVerified: boolean ): FormConfig
{
    const personalFields = applyFieldRules( PERSONAL_FIELD_NAMES, isVerified );
    const contactFields = applyFieldRules( CONTACT_FIELD_NAMES, isVerified );

    const validation = modelRegistry.getValidation( 'identity' )
        .pick( IDENTITY_FIELD_NAMES );

    return {
        context: { isCreate: false, service: 'identity', operation: 'update' },
        validationSchema: validation,
        groups: [
            {
                type: 'fields' as const,
                title: 'forms.identity.sections.personalDetails',
                fields: personalFields,
            },
            {
                type: 'fields' as const,
                title: 'forms.identity.sections.contactDetails',
                fields: contactFields,
            },
        ],
    };
}

/**
 * Builds the configuration for the personal details form only.
 *
 * @param isVerified - Whether the identity has been verified
 * @returns FormConfig for personal details
 */
export function buildPersonalFormConfig( isVerified: boolean ): FormConfig
{
    const fields = applyFieldRules( PERSONAL_FIELD_NAMES, isVerified );

    const validation = modelRegistry.getValidation( 'identity' )
        .pick( PERSONAL_FIELD_NAMES );

    return {
        context: { isCreate: false, service: 'identity', operation: 'update' },
        validationSchema: validation,
        groups: [
            {
                type: 'fields' as const,
                title: 'forms.identity.sections.personalDetails',
                fields,
            },
        ],
    };
}

/**
 * Builds the configuration for the contact details form only.
 *
 * @returns FormConfig for contact details
 */
export function buildContactFormConfig(): FormConfig
{
    const fields = applyFieldRules( CONTACT_FIELD_NAMES, false );

    const validation = modelRegistry.getValidation( 'identity' )
        .pick( CONTACT_FIELD_NAMES );

    return {
        context: { isCreate: false, service: 'identity', operation: 'update' },
        validationSchema: validation,
        groups: [
            {
                type: 'fields' as const,
                title: 'forms.identity.sections.contactDetails',
                fields,
            },
        ],
    };
}
