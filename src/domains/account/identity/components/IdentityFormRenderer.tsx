import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { buildIdentityFormConfig } from '../config/buildIdentityFormConfig';
import type { FormConfig, FormFieldConfig } from '@/components/forms/types/formConfig.types';
import type { BaseFormRendererProps } from '@/components/forms/renderers/BaseFormRenderer';
import type { Identity } from '../types/identity.types';

export interface IdentityFormRendererProps
{
    identity: Identity;
    onSubmit: ( data: Partial<Identity> ) => Promise<void> | void;
    loading?: boolean;
    error?: string;
    groupLayout?: BaseFormRendererProps['groupLayout'];
    formId?: string;
    buildConfig?: ( isVerified: boolean ) => FormConfig;
}

/**
 * Injects identity data as defaultValue on each field in the config.
 * Returns a shallow clone so the cached config is not mutated.
 * Only applies to field groups — status groups are passed through unchanged.
 */
function injectDefaults( config: FormConfig, identity: Identity ): FormConfig
{
    return {
        ...config,
        groups: config.groups.map( group =>
        {
            if( group.type !== 'fields' ) return group;
            return {
                ...group,
                fields: group.fields.map( ( field: FormFieldConfig ) => ( {
                    ...field,
                    defaultValue: identity[field.name as keyof Identity] ?? field.defaultValue,
                } ) ),
            };
        } ),
    };
}

/**
 * IdentityFormRenderer
 *
 * Config-driven form for viewing and editing user identity data.
 * Verified identity fields (firstname, lastname, dob) are disabled
 * when identityVerificationStatus is 'verified'.
 * Status values are rendered as a status group within the form.
 */
export function IdentityFormRenderer( {
    identity,
    onSubmit,
    loading,
    error,
    groupLayout,
    formId = 'identity-form',
    buildConfig = buildIdentityFormConfig,
}: IdentityFormRendererProps )
{
    const isVerified = identity.identityVerificationStatus === 'verified';
    const config = injectDefaults(
        buildConfig( isVerified ),
        identity,
    );

    return (
        <FormScaffold>
            <FormScaffold.Feedback message={error} />
            <FormScaffold.Body>
                <BaseFormRenderer
                    config={config}
                    onSubmit={onSubmit}
                    loading={loading}
                    formId={formId}
                    formScope="identity"
                    groupLayout={groupLayout}
                />
            </FormScaffold.Body>
        </FormScaffold>
    );
}
