/**
 * ExperimentDialog
 *
 * Creates an experiment, or edits the design of one. Pass `experiment` to open in edit
 * mode; omit for create. One dialog for both, because the design is the same six fields
 * either way — what is tested, what success looks like, and when it runs.
 *
 * The server refuses design changes once an experiment runs, and its error key shows in
 * the form's feedback slot like any other.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useCreateExperiment } from '../hooks/useCreateExperiment';
import { useUpdateExperiment } from '../hooks/useUpdateExperiment';
import { buildExperimentFormConfig } from '../config/buildExperimentFormConfig';
import type { Experiment } from '../types/experiment.types';

const FORM_ID = 'experiment-form';

/** Fields a blank input clears rather than sends as an empty string. */
const NULLABLE_FIELDS = ['thresholdValue', 'thresholdDirection', 'windowStart', 'windowEnd'];

export interface ExperimentDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing experiment to edit its design. */
    experiment?: Experiment | null;
    /** Called with the new experiment's id once it is created. */
    onCreated?: ( experimentId: string ) => void;
}

/** A blank field arrives as ''; the server stores the absence of a value as null. */
function withBlanksCleared( data: Record<string, unknown> ): Partial<Experiment>
{
    const cleared = { ...data };

    for( const key of NULLABLE_FIELDS )
    {
        if( cleared[key] === '' || cleared[key] === undefined ) cleared[key] = null;
    }

    return cleared as Partial<Experiment>;
}

export function ExperimentDialog( { open, onClose, experiment, onCreated }: ExperimentDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!experiment;
    const createMutation = useCreateExperiment();
    const updateMutation = useUpdateExperiment( experiment?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    /** Remounts the renderer so a reopened form starts from the record, or empty. */
    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( key => key + 1 ); }, [open] );

    const config = buildExperimentFormConfig( experiment ?? undefined );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const payload = withBlanksCleared( data );

        if( isEdit )
        {
            await updateMutation.mutateAsync( payload );
        }
        else
        {
            const created = await createMutation.mutateAsync( payload );
            onCreated?.( created.id );
        }

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
            title={t( isEdit ? 'forms.experiment.editTitle' : 'forms.experiment.title' )}
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
                            : t( isEdit ? 'shared.buttons.save' : 'forms.experiment.submitButton' )}
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
                        formScope="experiment"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
