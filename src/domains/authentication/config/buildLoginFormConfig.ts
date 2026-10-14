import { formFieldFactory } from '@/components/forms/utils/FormFieldFactory';
import { modelRegistry } from '@/core/models/ModelRegistry';
import type { FormConfig } from '@/components/forms/types/formConfig.types';

/**
 * Module-level cache for provide email form config.
 * Built once on first call and reused for entire app lifecycle since config is static.
 */
let cachedConfig: FormConfig | null = null;

/**
 * Builds the configuration for the login form.
 *
 * Creates a simple single-group form with email and password fields
 * from the identity model. Uses backend validation schema.
 *
 * @returns FormConfig with email/password fields and identity validation
 */
export function buildLoginFormConfig(): FormConfig
{
    // Return cached config if already built
    if( cachedConfig )
    {
        return cachedConfig;
    }

    // Get identity fields from model registry (backend-driven)
    const fields = formFieldFactory.getFormFields( 'identity' )
        .filter( f => ['email', 'password'].includes( f.name ) );

    // Get validation schema from model registry (stays in sync with backend)
    const validation = modelRegistry.getValidation( 'identity' )
        .pick( ['email', 'password'] );

    // Cache the config
    cachedConfig = {
        context: {
            isCreate: true,
            service: 'identity',
            operation: 'create',
            regionCode: 'global'
        },
        validationSchema: validation,
        groups: [{
            type: 'fields',
            title: '', // No group title for simple login form
            fields,
        }],
        footerLink:
        {
            prefaceText: 'pages.login.needAccount',
            href: '/auth/register',
            linkText: 'pages.login.register'
        }
    };

    return cachedConfig;
}