/**
 * ChannelIdeaDialog
 *
 * Adds an idea to the Bullseye board, or edits one. Pass `idea` with an id to edit it;
 * pass `idea` without one to start a new idea pre-filled — a channel and a ring from the
 * channel library, say.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { typeCatalogue } from '@/domains/system';
import { useCreateChannelIdea } from '../hooks/useCreateChannelIdea';
import { useUpdateChannelIdea } from '../hooks/useUpdateChannelIdea';
import { buildChannelIdeaFormConfig } from '../config/buildChannelIdeaFormConfig';
import type { ChannelIdea } from '../types/channelIdea.types';

const FORM_ID = 'channel-idea-form';

export interface ChannelIdeaDialogProps
{
    open: boolean;
    onClose: () => void;
    /** An existing idea to edit, or a partial one to start from. */
    idea?: Partial<ChannelIdea> | null;
}

export function ChannelIdeaDialog( { open, onClose, idea }: ChannelIdeaDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!idea?.id;
    const createMutation = useCreateChannelIdea();
    const updateMutation = useUpdateChannelIdea( idea?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( key => key + 1 ); }, [open] );

    const config = buildChannelIdeaFormConfig( typeCatalogue, idea ?? undefined );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const values: Record<string, unknown> = {
            channelId: data['channelId'],
            title: String( data['title'] ?? '' ).trim(),
            description: typeof data['description'] === 'string' && data['description'].trim() ? data['description'].trim() : null,
            ring: data['ring'],
        };

        if( isEdit ) await updateMutation.mutateAsync( values as Partial<ChannelIdea> );
        else await createMutation.mutateAsync( values as Partial<ChannelIdea> );

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
            title={t( isEdit ? 'forms.channelIdea.editTitle' : 'forms.channelIdea.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button variant="contained" form={FORM_ID} type="submit" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? t( 'shared.interactions.saving' )
                            : t( isEdit ? 'shared.buttons.save' : 'forms.channelIdea.submitButton' )}
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
                        formScope="channelIdea"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
