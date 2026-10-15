/**
 * ConnectionDialog
 *
 * Connects a tool, or edits a connection. Pass `connection` to open in edit mode; omit for
 * create. Creating a connection backfills the connector's history and, when scheduled,
 * keeps pulling from there.
 *
 * Connector settings are sent as the connector's own brief defines them; a connector with
 * none needs nothing here. The server refuses a connector whose credentials cannot yet be
 * stored, and its error key shows in the form's feedback slot.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@/components/ui';
import { FormScaffold } from '@/components/forms/scaffold/FormScaffold';
import { BaseFormRenderer } from '@/components/forms/renderers/BaseFormRenderer';
import { formatApiError } from '@/core/utils';
import { useConnectorCatalog } from '../hooks/useConnectorCatalog';
import { useCreateConnection } from '../hooks/useCreateConnection';
import { useUpdateConnection } from '../hooks/useUpdateConnection';
import { buildConnectionFormConfig } from '../config/buildConnectionFormConfig';
import type { Connection } from '../types/connection.types';

const FORM_ID = 'connection-form';

export interface ConnectionDialogProps
{
    open: boolean;
    onClose: () => void;
    /** Pass an existing connection to edit it. */
    connection?: Connection | null;
    /** Called with the new connection's id once it is created. */
    onCreated?: ( connectionId: string ) => void;
}

export function ConnectionDialog( { open, onClose, connection, onCreated }: ConnectionDialogProps )
{
    const { t } = useTranslation();

    const isEdit = !!connection;
    const createMutation = useCreateConnection();
    const updateMutation = useUpdateConnection( connection?.id ?? '' );
    const mutation = isEdit ? updateMutation : createMutation;

    const { data: catalog = [] } = useConnectorCatalog();

    const [formKey, setFormKey] = useState( 0 );
    useEffect( () => { if( open ) setFormKey( key => key + 1 ); }, [open] );

    const config = buildConnectionFormConfig( catalog, connection ?? undefined );

    const handleSubmit = async ( data: Record<string, unknown> ) =>
    {
        const values: Record<string, unknown> = {
            label: typeof data['label'] === 'string' && data['label'].trim() ? data['label'].trim() : null,
            isActive: data['isActive'] === true,
            pullIntervalMinutes: Number( data['pullIntervalMinutes'] ),
        };

        if( isEdit )
        {
            await updateMutation.mutateAsync( values as Partial<Connection> );
        }
        else
        {
            const created = await createMutation.mutateAsync( {
                ...values, connectorName: data['connectorName'], settings: {},
            } as Partial<Connection> );
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
            title={t( isEdit ? 'forms.connection.editTitle' : 'forms.connection.title' )}
            actions={
                <>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        {t( 'shared.buttons.cancel' )}
                    </Button>
                    <Button variant="contained" form={FORM_ID} type="submit" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? t( 'shared.interactions.saving' )
                            : t( isEdit ? 'shared.buttons.save' : 'forms.connection.submitButton' )}
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
                        formScope="connection"
                    />
                </FormScaffold.Body>
            </FormScaffold>
        </Dialog>
    );
}
