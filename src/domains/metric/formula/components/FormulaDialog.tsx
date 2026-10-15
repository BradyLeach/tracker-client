/**
 * FormulaDialog
 *
 * Creates a formula, or edits one. Pass `formula` to open in edit mode; omit for create.
 *
 * The expression combines metric keys with + - * /, parentheses, min, max and abs. The
 * server parses it and names the position and token of any mistake, which shows in the
 * form's feedback slot — the client keeps no second parser to drift from the first.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useCreateFormula } from '../hooks/useCreateFormula';
import { useUpdateFormula } from '../hooks/useUpdateFormula';
import { buildFormulaFormConfig } from '../config/buildFormulaFormConfig';
import type { Formula } from '../types/formula.types';

const FORM_ID = 'formula-form';

export interface FormulaDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing formula to edit it. */
    formula?: Formula | null;
}

export function FormulaDialog( { open, onClose, formula }: FormulaDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!formula;
    const createMutation = useCreateFormula();
    const updateMutation = useUpdateFormula( formula?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( key => key + 1 ); }, [open] );

    const config = buildFormulaFormConfig( formula ?? undefined );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const values: Record<string, unknown> = {
            ...( isEdit ? {} : { key: String( data['key'] ?? '' ).trim() } ),
            label: typeof data['label'] === 'string' && data['label'].trim() ? data['label'].trim() : null,
            expression: String( data['expression'] ?? '' ).trim(),
            outputUnit: data['outputUnit'],
        };

        if( isEdit ) await updateMutation.mutateAsync( values as Partial<Formula> );
        else await createMutation.mutateAsync( values as Partial<Formula> );

        handleClose();
    };

    const handleClose = () =>
    {
        createMutation.reset();
        updateMutation.reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            title={t( isEdit ? 'forms.formula.editTitle' : 'forms.formula.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button
                        variant="contained"
                        form={FORM_ID}
                        type="submit"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending
                            ? t( 'shared.interactions.saving' )
                            : t( isEdit ? 'shared.buttons.save' : 'forms.formula.submitButton' )}
                    </Button>
                </>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={mutation.error ? formatApiError( t, mutation.error ) : undefined} />
                <FormScaffold.Body>
                    <BaseFormRenderer
                        key={formKey}
                        config={config}
                        onSubmit={handleSubmit}
                        loading={mutation.isPending}
                        formId={FORM_ID}
                        formScope="formula"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
