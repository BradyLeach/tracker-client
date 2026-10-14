import { useMemo } from 'react';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { FormConfigFooter } from '@/components/forms/footer/FormConfigFooter';
import { buildRegistrationFormConfig } from '../config/buildRegistrationFormConfig';
import { Button, type AutocompleteOption } from '@/components/ui';
import { usePublicCountries, useContextDefaults } from '@/domains/system';
import { useTranslation } from 'react-i18next';

/**
 * Props for RegistrationFormRenderer.
 */
export interface RegistrationFormRendererProps
{
    /** Called when the form is submitted. */
     
    onSubmit: ( data: any ) => Promise<void> | void;
    /** Whether the form is currently submitting/loading. */
    loading?: boolean;
    /** Optional error message to display. */
    error?: string;
    /** Optional header title. */
    title?: string;
    /** Optional header subtitle. */
    subtitle?: string;
}

/**
 * RegistrationFormRenderer
 *
 * Single-page registration form using FormScaffold architecture.
 * Collects identity details, company name, credentials, and T&C acceptance.
 *
 * @param props - Component props
 * @returns Rendered registration form
 */
export function RegistrationFormRenderer( {
    onSubmit,
    loading,
    error,
    title,
    subtitle,
}: RegistrationFormRendererProps )
{
    const { t } = useTranslation();

    // The country catalog is public and cached, so it is available before a session exists.
    // The IP-based default only pre-selects the field — the user is shown it and can change
    // it, because the jurisdiction the account is bound to is theirs to state.
    const { data: countries } = usePublicCountries();
    const { defaultCountryId } = useContextDefaults();

    const countryOptions: AutocompleteOption[] = useMemo(
        () => ( countries ?? [] ).map( country => ( { value: country.id, label: country.label } ) ),
        [countries]
    );

    const config = useMemo(
        () => buildRegistrationFormConfig( countryOptions, { countryId: defaultCountryId } ),
        [countryOptions, defaultCountryId]
    );

    return (
        <FormScaffold>
            <FormScaffold.Header
                title={title}
                subtitle={subtitle}
            />
            <FormScaffold.Feedback message={error} />
            <FormScaffold.Body>
                <BaseFormRenderer
                    config={config}
                    onSubmit={onSubmit}
                    loading={loading}
                    formId="registration-form"
                    formScope="registration"
                />
            </FormScaffold.Body>
            <FormScaffold.Actions>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    type="submit"
                    form="registration-form"
                    disabled={loading}
                >
                    {loading ? t( 'shared.interactions.loading' ) : t( 'forms.registration.registerButton' )}
                </Button>
            </FormScaffold.Actions>
            <FormScaffold.Footer>
                <FormConfigFooter config={config} />
            </FormScaffold.Footer>
        </FormScaffold>
    );
}
