import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { BaseFormRenderer } from '@/components/forms/renderers';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { buildProvideEmailFormConfig } from '../config/buildProvideEmailFormConfig';
import { type ProvideEmailFormFields } from '../types/formFields.types';

// Props defined in the same file as the component
interface ProvideEmailFormProps
{
    title?: string;
    subtitle?: string;
    onSubmit: ( data: ProvideEmailFormFields ) => Promise<void> | void;
    loading?: boolean;
    error?: string;
}

export function FormRendererProvideEmail( { title, subtitle, onSubmit, loading, error }: ProvideEmailFormProps )
{
    const config = buildProvideEmailFormConfig(); // Cached after first call
    const { t } = useTranslation();

    return (
        <FormScaffold>
            <FormScaffold.Header title={title} subtitle={subtitle} />
            <FormScaffold.Feedback message={error} align="center" />
            <FormScaffold.Body>
                <BaseFormRenderer<ProvideEmailFormFields>
                    config={config}
                    onSubmit={onSubmit}
                    loading={loading}
                    formScope="provideEmail"
                    formId="provideEmail"
                />
            </FormScaffold.Body>
            <FormScaffold.Actions>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    type="submit"
                    form="provideEmail"
                    disabled={loading}
                >
                    {t( 'shared.buttons.submit' )}
                </Button>
            </FormScaffold.Actions>

        </FormScaffold>
    );
}