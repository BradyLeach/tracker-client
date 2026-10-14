/**
 * EditCompanyDialog
 *
 * Opens a dialog to edit an existing company record.
 * Pass `company` to pre-populate fields; dialog closes on successful save.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { useUpdateCompany } from '../hooks/useUpdateCompany';
import { buildCompanyFormConfig } from '../config/buildCompanyFormConfig';
import type { Company } from '../types/company.types';

const FORM_ID = 'edit-company-form';

export interface EditCompanyDialogProps
{
    open: boolean;
    onClose: () => void;
    company: Company | null;
}

export function EditCompanyDialog( { open, onClose, company }: EditCompanyDialogProps )
{
    const { t } = useTranslation();

    const { mutateAsync, isPending, error, reset } = useUpdateCompany( company?.id ?? '' );

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( k => k + 1 ); }, [open] );

    // The record itself, not a hand-picked copy of it. The form takes its fields from the
    // model, so listing them again here only creates a second list to forget to update —
    // which is how the tax identifier came to be missing from a form that renders it.
    const config = buildCompanyFormConfig( company ?? undefined );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        await mutateAsync( data as Partial<Company> );
        handleClose();
    };

    const handleClose = () =>
    {
        reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            title={t( 'forms.company.editTitle' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        variant="contained"
                        form={FORM_ID}
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? t( 'shared.interactions.saving' ) : t( 'shared.buttons.save' )}
                    </Button>
                </>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={error ? t( error.key ) : undefined} />
                <FormScaffold.Body>
                    <BaseFormRenderer
                        key={formKey}
                        config={config}
                        onSubmit={handleSubmit}
                        loading={isPending}
                        formId={FORM_ID}
                        formScope="company"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
