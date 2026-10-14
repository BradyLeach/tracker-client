import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { FormConfigFooter } from '@/components/forms/footer/FormConfigFooter';
import { buildLoginFormConfig } from '../config/buildLoginFormConfig';
import { Button, Box } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { SmartLink } from '@/components/shared/links/SmartLink';

/**
 * Props for LoginFormRenderer.
 */
export interface LoginFormRendererProps
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
 * LoginFormRenderer
 *
 * Enterprise-grade login form using FormScaffold architecture.
 * Provides consistent layout with config-driven form fields,
 * social login options, and remember me functionality.
 *
 * @param props - Component props
 * @returns Rendered login form
 */
export function LoginFormRenderer( {
    onSubmit,
    loading,
    error,
    title,
    subtitle,
}: LoginFormRendererProps )
{
    const { t } = useTranslation();
    const config = buildLoginFormConfig();

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
                    formId="login-form"
                    formScope="login"
                />

                {/* Forgot Password - positioned after form fields */}
                <Box display="flex" alignItems="center" justifyContent="flex-end" mt={2}>
                    <SmartLink
                        href="/auth/forgot-password"
                        variant="body2"
                        sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                        }}
                    >
                        {t( 'forms.login.forgotPassword' )}
                    </SmartLink>
                </Box>
            </FormScaffold.Body>
            <FormScaffold.Actions>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    type="submit"
                    form="login-form"
                    disabled={loading}
                >
                    {loading ? t( 'shared.interactions.loading' ) : t( 'forms.login.loginButton' )}
                </Button>

                {/* Social Login */}
            </FormScaffold.Actions>
            <FormScaffold.Footer>
                <FormConfigFooter config={config} />
            </FormScaffold.Footer>
        </FormScaffold>
    );
}