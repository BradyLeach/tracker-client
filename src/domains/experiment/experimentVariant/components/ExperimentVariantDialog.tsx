/**
 * ExperimentVariantDialog
 *
 * Adds a variant to an experiment, or edits one. Pass `variant` to open in edit mode;
 * omit for create. The label and control flag are the form; the attribution is edited
 * below it and sent with the form values on submit.
 *
 * The server holds the rules — exactly one control, changes only while the experiment
 * is a draft, filters only on dimensions the source allows — and its error key shows in
 * the form's feedback slot.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Dialog } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { useMeasurementSources } from '@/domains/measurement';
import { useCreateExperimentVariant } from '../hooks/useCreateExperimentVariant';
import { useUpdateExperimentVariant } from '../hooks/useUpdateExperimentVariant';
import { buildExperimentVariantFormConfig } from '../config/buildExperimentVariantFormConfig';
import { AttributionEditor } from './AttributionEditor';
import type { AttributionEntry, ExperimentVariant } from '../types/experimentVariant.types';

const FORM_ID = 'experiment-variant-form';

export interface ExperimentVariantDialogProps
{
    open: boolean;
    onClose: () => void;
    experimentId: string;
    /** Pass an existing variant to edit it. */
    variant?: ExperimentVariant | null;
}

export function ExperimentVariantDialog( { open, onClose, experimentId, variant }: ExperimentVariantDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!variant;
    const createMutation = useCreateExperimentVariant();
    const updateMutation = useUpdateExperimentVariant( variant?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const { data: sources = [] } = useMeasurementSources();

    const [attribution, setAttribution] = useState<AttributionEntry[]>( [] );

    /** Remounts the renderer and re-seeds the attribution, so a reopened dialog starts from the record. */
    const [formKey, setFormKey] = useState( 0 );
    useEffect( () =>
    {
        if( !open ) return;
        setFormKey( key => key + 1 );
        setAttribution( variant?.attribution ?? [] );
    }, [open, variant] );

    const config = buildExperimentVariantFormConfig( variant ?? undefined );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const payload: Partial<ExperimentVariant> = {
            label: String( data['label'] ?? '' ).trim(),
            isControl: data['isControl'] === true,
            attribution,
        };

        if( isEdit ) await updateMutation.mutateAsync( payload );
        else await createMutation.mutateAsync( { ...payload, experimentId } );

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
            maxWidth="md"
            title={t( isEdit ? 'forms.experimentVariant.editTitle' : 'forms.experimentVariant.title' )}
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
                            : t( isEdit ? 'shared.buttons.save' : 'forms.experimentVariant.submitButton' )}
                    </Button>
                </>
            }
        >
            <FormScaffold>
                <FormScaffold.Feedback message={mutation.error ? t( mutation.error.key ) : undefined} />
                <FormScaffold.Body>
                    <BaseFormRenderer
                        key={formKey}
                        config={config}
                        onSubmit={handleSubmit}
                        loading={mutation.isPending}
                        formId={FORM_ID}
                        formScope="experimentVariant"
                    />
                    <Box sx={{ mt: 3 }}>
                        <AttributionEditor
                            value={attribution}
                            onChange={setAttribution}
                            sources={sources}
                            disabled={mutation.isPending}
                        />
                    </Box>
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
