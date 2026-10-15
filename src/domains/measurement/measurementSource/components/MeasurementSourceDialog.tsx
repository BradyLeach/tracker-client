/**
 * MeasurementSourceDialog
 *
 * Creates a measurement source, or edits one. Pass `source` to open in edit mode; omit
 * for create. The server holds the rules — a bucket source needs a bucket size, an event
 * source has none — and its error key shows in the form's feedback slot.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useCreateMeasurementSource } from '../hooks/useCreateMeasurementSource';
import { useUpdateMeasurementSource } from '../hooks/useUpdateMeasurementSource';
import { buildMeasurementSourceFormConfig } from '../config/buildMeasurementSourceFormConfig';
import type { MeasurementSource } from '../types/measurementSource.types';

const FORM_ID = 'measurement-source-form';

export interface MeasurementSourceDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing source to edit it. */
    source?: MeasurementSource | null;
    /** Called with the new source's id once it is created. */
    onCreated?: ( sourceId: string ) => void;
}

export function MeasurementSourceDialog( { open, onClose, source, onCreated }: MeasurementSourceDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!source;
    const createMutation = useCreateMeasurementSource();
    const updateMutation = useUpdateMeasurementSource( source?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( key => key + 1 ); }, [open] );

    const config = buildMeasurementSourceFormConfig( source ?? undefined );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const values: Record<string, unknown> = {
            ...data,
            label: typeof data['label'] === 'string' && data['label'].trim() ? data['label'].trim() : null,
            allowedMeasurementNames: data['allowedMeasurementNames'] ?? [],
            allowedDimensionKeys: data['allowedDimensionKeys'] ?? [],
        };

        // An event source has no bucket size at all: the server reads any value, even null, as one.
        if( !isEdit && values['sourceType'] !== 'bucket' ) delete values['bucketSize'];

        if( isEdit )
        {
            await updateMutation.mutateAsync( values as Partial<MeasurementSource> );
        }
        else
        {
            const created = await createMutation.mutateAsync( values as Partial<MeasurementSource> );
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
            title={t( isEdit ? 'forms.measurementSource.editTitle' : 'forms.measurementSource.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button variant="contained" form={FORM_ID} type="submit" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? t( 'shared.interactions.saving' )
                            : t( isEdit ? 'shared.buttons.save' : 'forms.measurementSource.submitButton' )}
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
                        formScope="measurementSource"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
