import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { BaseFormRenderer } from '@/components/forms/renderers';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { buildProvideCodeFormConfig } from '../config/buildProvideCodeFormConfig';
import { type ProvideCodeFormFields } from '../types/formFields.types';

// Props defined in the same file as the component
interface ProvideCodeFormProps
{
    title?: string;
    subtitle?: string;
    onSubmit: ( data: ProvideCodeFormFields ) => Promise<void> | void;
    loading?: boolean;
    error?: string;
}

export function FormRendererProvideCode( { title, subtitle, onSubmit, loading, error }: ProvideCodeFormProps )
{
    const config = buildProvideCodeFormConfig(); // Cached after first call
    const { t } = useTranslation();

    return (
        <FormScaffold>
            <FormScaffold.Header title={title} subtitle={subtitle} />
            <FormScaffold.Feedback message={error} align="center" />
            <FormScaffold.Body>
                <BaseFormRenderer<ProvideCodeFormFields>
                    config={config}
                    onSubmit={onSubmit}
                    loading={loading}
                    formScope="provideCode"
                    formId="provideCode"
                />
            </FormScaffold.Body>
            <FormScaffold.Actions>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    type="submit"
                    form="provideCode"
                    disabled={loading}
                >
                    {t( 'shared.buttons.submit' )}
                </Button>
            </FormScaffold.Actions>
        </FormScaffold>
    );
}