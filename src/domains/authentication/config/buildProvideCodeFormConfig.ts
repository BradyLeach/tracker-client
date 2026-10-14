import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import yup from '@/core/validation/yup/yupExtensions';

/**
 * Module-level cache for provide 'code' form config.
 * Built once on first call and reused for entire app lifecycle since config is static.
 */
let cachedConfig: FormConfig | null = null;

export function buildProvideCodeFormConfig(): FormConfig
{
    // Return cached config if already built
    if( cachedConfig )
    {
        return cachedConfig;
    }

    // UI-only field: password confirmation (not in backend model)
    const code: FormFieldConfig = {
        name: 'code',
        type: 'code',
        required: true,
        virtual: false, // Include from API payload
        hideLabel: true,
    };

    // Get validation schema from model registry (stays in sync with backend)
    const validation = yup.object( {
        code: yup.string().verificationCode()
    } );

    // Cache the config
    cachedConfig = {
        validationSchema: validation,
        groups: [{
            type: 'fields',
            fields: [code]
        }]
    };

    return cachedConfig;
}

